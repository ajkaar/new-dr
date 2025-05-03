
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Save, Download, Trash2, RefreshCw } from "lucide-react";
import { Redirect } from "wouter";
import AppLayout from "@/components/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  topic: string;
  content: string;
  style: string;
  language: string;
  createdAt: string;
}

export default function NotesMakerPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [noteStyle, setNoteStyle] = useState("Bullet Points");
  const [language, setLanguage] = useState("Simplified English");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState<string>("");
  const [savedNotes, setSavedNotes] = useState<Note[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [relatedTopics, setRelatedTopics] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchSavedNotes();
    }
  }, [user]);

  const fetchSavedNotes = async () => {
    try {
      setIsLoadingNotes(true);
      const response = await fetch('/api/notes/history');
      const data = await response.json();
      setSavedNotes(data.notes || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch saved notes",
        variant: "destructive"
      });
      setSavedNotes([]);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const handleGenerateNotes = async () => {
    if (!topic) {
      toast({
        title: "Error",
        description: "Please enter a topic",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/notes/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          topic, 
          noteStyle, 
          language,
          detail: noteStyle // Map style to detail level
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate notes');
      }

      const data = await response.json();
      
      if (data.text) {
        setGeneratedNotes(data.text);
        setRelatedTopics(data.relatedTopics || []);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to generate notes:', error);
      toast({
        title: "Error",
        description: "Failed to generate notes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      await fetch('/api/notes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          content: generatedNotes,
          style: noteStyle,
          language
        })
      });

      toast({
        title: "Success",
        description: "Notes saved successfully"
      });
      fetchSavedNotes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive"
      });
    }
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDelete = async (noteId: string) => {
    try {
      await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      toast({
        title: "Success",
        description: "Note deleted successfully"
      });
      fetchSavedNotes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return (
    <AppLayout
      title="Notes Maker"
      description="Generate AI-powered medical study notes"
    >
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Generate New Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Enter medical topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <Select value={noteStyle} onValueChange={setNoteStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select note style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bullet Points">Bullet Points</SelectItem>
                  <SelectItem value="Detailed Explanation">Detailed Explanation</SelectItem>
                  <SelectItem value="Mnemonics + Memory Aids">Mnemonics + Memory Aids</SelectItem>
                </SelectContent>
              </Select>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Formal English">Formal English</SelectItem>
                  <SelectItem value="Simplified English">Simplified English</SelectItem>
                  <SelectItem value="Hinglish">Hinglish</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleGenerateNotes} 
              disabled={isGenerating || !topic}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Notes...
                </>
              ) : (
                "Generate Notes"
              )}
            </Button>
          </CardContent>
        </Card>

        {generatedNotes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Generated Notes
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleGenerateNotes()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                  <Button variant="outline" onClick={() => handleSaveNotes()}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => handleDownload(generatedNotes, topic)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:text-primary prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-p:text-base prose-p:leading-7 prose-a:text-primary prose-strong:text-primary/90 prose-ul:list-disc prose-ol:list-decimal prose-li:my-1 prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300" dangerouslySetInnerHTML={{ __html: generatedNotes }} />
              
              {relatedTopics.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Related Topics:</h4>
                  <div className="flex flex-wrap gap-2">
                    {relatedTopics.map((topic, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTopic(topic);
                          handleGenerateNotes();
                        }}
                      >
                        {topic}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {isLoadingNotes ? (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            </CardContent>
          </Card>
        ) : savedNotes && savedNotes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Saved Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {savedNotes.map((note) => (
                  <Card key={note.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{note.topic}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(note.createdAt).toLocaleDateString()} • {note.style} • {note.language}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(note.content, note.topic)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(note.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:text-primary prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-p:text-base prose-p:leading-7 prose-a:text-primary prose-strong:text-primary/90 prose-ul:list-disc prose-ol:list-decimal prose-li:my-1 prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300" dangerouslySetInnerHTML={{ __html: note.content }} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
