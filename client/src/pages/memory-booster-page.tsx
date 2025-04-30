import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AppLayout from '@/components/layouts/app-layout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { generateMnemonic } from '@/lib/ai-service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Brain, 
  Bookmark, 
  Lightbulb, 
  Share2, 
  Printer, 
  Loader2, 
  Copy, 
  CheckCircle2,
  ImageIcon,
  Sparkles,
  Download,
  Search,
  AlarmClock
} from 'lucide-react';
import { queryClient } from '@/lib/queryClient';

// Form schema
const formSchema = z.object({
  topic: z.string().min(3, {
    message: "Topic must be at least 3 characters long",
  }),
  category: z.string().optional(),
  complexity: z.string().optional(),
});

// Suggested topics by category
const suggestedTopics: Record<string, string[]> = {
  anatomy: [
    "Cranial nerves and their functions",
    "Brachial plexus and its branches",
    "Bones of the human skull",
    "Branches of the facial nerve",
    "Muscles of facial expression"
  ],
  biochemistry: [
    "Glycolysis enzymes and steps",
    "Urea cycle intermediates",
    "Vitamins and their deficiency diseases",
    "Amino acid classifications",
    "Lysosomal storage diseases"
  ],
  pharmacology: [
    "Beta-blocker drugs and their selectivity",
    "Antihypertensive drug classes",
    "Antibiotics mechanism of action",
    "Antiepileptic drugs side effects",
    "Anticoagulant drugs and their targets"
  ],
  pathology: [
    "Tumor markers and associated cancers",
    "Classification of anemias",
    "Autoimmune disease characteristics",
    "Leukemia classification",
    "Tumor suppressor genes and their cancers"
  ],
  microbiology: [
    "Gram positive vs negative bacteria",
    "DNA viruses and associated diseases",
    "Bacterial toxins and mechanisms",
    "Parasitic life cycles",
    "Fungal infections classification"
  ]
};

// Interface for saved mnemonic
interface SavedMnemonic {
  id: string;
  topic: string;
  category: string;
  content: string;
  dateCreated: Date;
  isFavorite: boolean;
}

// Sample mnemonics for the UI
const sampleMnemonics: SavedMnemonic[] = [
  {
    id: '1',
    topic: 'Cranial Nerves',
    category: 'anatomy',
    content: `"Oh Oh Oh, To Touch And Feel Very Good Velvet, Ah Heaven!"

1. O - Olfactory (I) - Smell
2. O - Optic (II) - Vision
3. O - Oculomotor (III) - Eye movement, pupil constriction
4. T - Trochlear (IV) - Downward, inward eye movement
5. T - Trigeminal (V) - Face sensation, chewing
6. A - Abducens (VI) - Lateral eye movement
7. F - Facial (VII) - Facial expression, taste (anterior 2/3 of tongue)
8. V - Vestibulocochlear (VIII) - Hearing and balance
9. G - Glossopharyngeal (IX) - Taste (posterior 1/3 of tongue), swallowing
10. V - Vagus (X) - Parasympathetic to organs, swallowing, speaking
11. A - Accessory (XI) - Head/shoulder movements
12. H - Hypoglossal (XII) - Tongue movement

This mnemonic helps remember the order and basic functions of all twelve cranial nerves. The first letter of each word corresponds to the first letter of each cranial nerve.`,
    dateCreated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    isFavorite: true
  },
  {
    id: '2',
    topic: 'Glycolysis Enzymes',
    category: 'biochemistry',
    content: `"Please Help Every PoorGI Path Find His Favorite Pyruvate Kinase"

1. P - Phosphohexose isomerase
2. H - Hexokinase/Glucokinase
3. E - Enolase
4. P - Phosphofructokinase
5. GI - Glyceraldehyde-3-phosphate dehydrogenase
6. P - Phosphoglycerate kinase
7. F - Fructose bisphosphate aldolase
8. H - Hexose diphosphatase
9. F - Fructose-6-phosphate kinase
10. P - Phosphoglycerate mutase
11. K - Pyruvate kinase

This mnemonic helps remember the enzymes involved in glycolysis. The pathway is crucial for breaking down glucose to produce ATP and pyruvate.`,
    dateCreated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    isFavorite: false
  },
  {
    id: '3',
    topic: 'Antihypertensive Drug Classes',
    category: 'pharmacology',
    content: `"ABCD VIP"

A - ACE inhibitors (e.g., enalapril, lisinopril)
B - Beta-blockers (e.g., metoprolol, atenolol)
C - Calcium channel blockers (e.g., amlodipine, nifedipine)
D - Diuretics (e.g., hydrochlorothiazide, furosemide)

V - Vasodilators (e.g., hydralazine, minoxidil)
I - ARBs (Angiotensin II Receptor Blockers) (e.g., losartan, valsartan)
P - Peripheral adrenergic antagonists (e.g., prazosin, doxazosin)

This mnemonic helps remember the seven major classes of antihypertensive medications. The "ABCD" part is particularly useful as it includes the four first-line drug classes.`,
    dateCreated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    isFavorite: true
  }
];

type FormValues = z.infer<typeof formSchema>;

const MemoryBoosterPage: React.FC = () => {
  const [mnemonicResult, setMnemonicResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('generate');
  const [savedMnemonics, setSavedMnemonics] = useState<SavedMnemonic[]>(sampleMnemonics);
  const [isCopied, setIsCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Filter saved mnemonics based on search and category
  const filteredMnemonics = savedMnemonics.filter(mnemonic => {
    const matchesSearch = mnemonic.topic.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          mnemonic.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? mnemonic.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      category: 'anatomy',
      complexity: 'moderate',
    },
  });

  // Watch form values for real-time updates
  const category = form.watch('category');

  // Submit handler
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const response = await generateMnemonic(values.topic);
      
      setMnemonicResult(response.mnemonic);
      
      // Update token usage if user exists
      if (response.tokenUsage && user) {
        queryClient.setQueryData(['/api/user'], {
          ...user,
          tokenUsage: response.tokenUsage.current
        });
      }
      
      toast({
        title: "Mnemonic Generated",
        description: "Your memory aid has been created successfully.",
      });
    } catch (error) {
      console.error("Mnemonic generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate mnemonic. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fill a suggested topic
  const fillSuggestedTopic = (topic: string) => {
    form.setValue('topic', topic);
  };

  // Save the generated mnemonic
  const saveMnemonic = () => {
    if (!mnemonicResult) return;
    
    const newMnemonic: SavedMnemonic = {
      id: Date.now().toString(),
      topic: form.getValues().topic,
      category: form.getValues().category || 'other',
      content: mnemonicResult,
      dateCreated: new Date(),
      isFavorite: false,
    };
    
    setSavedMnemonics(prev => [newMnemonic, ...prev]);
    
    toast({
      title: "Mnemonic Saved",
      description: "Your mnemonic has been saved to your collection.",
    });
  };

  // Toggle favorite status
  const toggleFavorite = (id: string) => {
    setSavedMnemonics(prev => 
      prev.map(m => 
        m.id === id ? { ...m, isFavorite: !m.isFavorite } : m
      )
    );
  };

  // Delete a mnemonic
  const deleteMnemonic = (id: string) => {
    setSavedMnemonics(prev => prev.filter(m => m.id !== id));
    
    toast({
      title: "Mnemonic Deleted",
      description: "The mnemonic has been removed from your collection.",
    });
  };

  // Copy mnemonic to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    
    toast({
      title: "Copied to Clipboard",
      description: "Mnemonic has been copied to your clipboard.",
    });
    
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Print mnemonic
  const printMnemonic = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Mnemonic: ${form.getValues().topic}</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
              h1 { color: #1976D2; }
              .content { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <h1>${form.getValues().topic}</h1>
            <div class="content">${mnemonicResult?.replace(/\n/g, '<br/>')}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <AppLayout 
      title="AI Memory Booster" 
      description="Generate mnemonics, visual cues, and memory aids to help you remember complex medical concepts."
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="generate">Generate Memory Aid</TabsTrigger>
          <TabsTrigger value="saved">My Mnemonics</TabsTrigger>
        </TabsList>
        
        {/* Generate Memory Aid Tab */}
        <TabsContent value="generate">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Create Memory Aid</CardTitle>
                  <CardDescription>
                    Generate a mnemonic or memory aid for any medical topic
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="topic"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Topic or Concept</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Cranial nerves, Krebs cycle enzymes, etc." 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Enter the specific medical concept you want to memorize
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="anatomy">Anatomy</SelectItem>
                                  <SelectItem value="biochemistry">Biochemistry</SelectItem>
                                  <SelectItem value="pharmacology">Pharmacology</SelectItem>
                                  <SelectItem value="pathology">Pathology</SelectItem>
                                  <SelectItem value="microbiology">Microbiology</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="complexity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Complexity</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select complexity" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="simple">Simple</SelectItem>
                                  <SelectItem value="moderate">Moderate</SelectItem>
                                  <SelectItem value="complex">Complex</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Memory Aid...
                          </>
                        ) : (
                          <>
                            <Brain className="mr-2 h-4 w-4" />
                            Generate Memory Aid
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              {/* Generated Mnemonic Result */}
              {mnemonicResult && (
                <Card className="mt-6">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{form.getValues().topic}</CardTitle>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => copyToClipboard(mnemonicResult)}
                        >
                          {isCopied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={printMnemonic}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      Category: {form.getValues().category || 'Other'} | 
                      Complexity: {form.getValues().complexity || 'Moderate'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap prose max-w-none">
                      {mnemonicResult}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setMnemonicResult(null);
                        form.reset();
                      }}
                    >
                      Create New
                    </Button>
                    <Button 
                      variant="default"
                      onClick={saveMnemonic}
                    >
                      <Bookmark className="mr-2 h-4 w-4" />
                      Save to Collection
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
            
            <div className="space-y-6">
              {/* Suggested Topics */}
              <Card>
                <CardHeader>
                  <CardTitle>Suggested Topics</CardTitle>
                  <CardDescription>
                    Popular topics in {category || 'medicine'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {suggestedTopics[category as keyof typeof suggestedTopics]?.map((topic, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start text-left"
                        onClick={() => fillSuggestedTopic(topic)}
                      >
                        <div className="truncate">{topic}</div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Memory Techniques */}
              <Card>
                <CardHeader>
                  <CardTitle>Memory Techniques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium flex items-center">
                      <AlarmClock className="h-4 w-4 mr-2 text-primary" />
                      Spaced Repetition
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Review mnemonics at increasing intervals to strengthen recall
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium flex items-center">
                      <ImageIcon className="h-4 w-4 mr-2 text-primary" />
                      Visual Association
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Link concepts to vivid mental images for stronger memory
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-primary" />
                      Method of Loci
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Associate items with locations in a familiar place
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium flex items-center">
                      <Lightbulb className="h-4 w-4 mr-2 text-primary" />
                      Chunking
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Group related information into manageable units
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="link" className="w-full" asChild>
                    <a href="/help-support#memory-techniques" target="_blank">
                      Learn more about memory techniques
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Saved Mnemonics Tab */}
        <TabsContent value="saved">
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Search your mnemonics..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={selectedCategory || ""}
                onValueChange={(value) => setSelectedCategory(value || null)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="anatomy">Anatomy</SelectItem>
                  <SelectItem value="biochemistry">Biochemistry</SelectItem>
                  <SelectItem value="pharmacology">Pharmacology</SelectItem>
                  <SelectItem value="pathology">Pathology</SelectItem>
                  <SelectItem value="microbiology">Microbiology</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Mnemonics Grid */}
            {filteredMnemonics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMnemonics.map((mnemonic) => (
                  <Card key={mnemonic.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{mnemonic.topic}</CardTitle>
                          <CardDescription>
                            {new Date(mnemonic.dateCreated).toLocaleDateString()} • {mnemonic.category}
                          </CardDescription>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => toggleFavorite(mnemonic.id)}
                          className={mnemonic.isFavorite ? 'text-yellow-500' : 'text-gray-400'}
                        >
                          <Bookmark className="h-5 w-5" fill={mnemonic.isFavorite ? 'currentColor' : 'none'} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="max-h-56 overflow-y-auto">
                      <div className="whitespace-pre-line text-sm">
                        {mnemonic.content.length > 300 
                          ? `${mnemonic.content.substring(0, 300)}...` 
                          : mnemonic.content
                        }
                      </div>
                    </CardContent>
                    <CardFooter className="bg-gray-50 border-t px-6 py-3">
                      <div className="flex justify-between w-full">
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteMnemonic(mnemonic.id)}
                        >
                          Delete
                        </Button>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyToClipboard(mnemonic.content)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                          >
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">No mnemonics found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery || selectedCategory 
                    ? "Try changing your search or filter criteria" 
                    : "Create your first mnemonic to see it here"}
                </p>
                <Button 
                  className="mt-6" 
                  onClick={() => setActiveTab('generate')}
                >
                  Create Your First Mnemonic
                </Button>
              </div>
            )}
            
            {/* Export/Import Section */}
            {filteredMnemonics.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Manage Collection</CardTitle>
                  <CardDescription>
                    Export your mnemonics or import from a file
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      variant="outline" 
                      className="sm:flex-1"
                      onClick={() => {
                        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedMnemonics));
                        const downloadAnchorNode = document.createElement('a');
                        downloadAnchorNode.setAttribute("href", dataStr);
                        downloadAnchorNode.setAttribute("download", "drnxt_mnemonics.json");
                        document.body.appendChild(downloadAnchorNode);
                        downloadAnchorNode.click();
                        downloadAnchorNode.remove();
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Collection
                    </Button>
                    <Button 
                      variant="outline" 
                      className="sm:flex-1"
                      onClick={() => {
                        toast({
                          title: "Coming Soon",
                          description: "The import feature will be available in a future update.",
                        });
                      }}
                    >
                      Import from File
                    </Button>
                    <Button 
                      variant="default" 
                      className="sm:flex-1"
                      onClick={() => setActiveTab('generate')}
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Create New Mnemonic
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default MemoryBoosterPage;
