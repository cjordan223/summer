import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserSummary } from "@/lib/user-service";
import Image from "next/image";
import { ListChecks, ExternalLink, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function SummaryCard({ summary, onSummaryUpdate }: { 
  summary: UserSummary; 
  onSummaryUpdate?: (videoId: string, newSummaryPoints: string[]) => void;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSummaryPoints, setCurrentSummaryPoints] = useState(summary.summaryPoints);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log('🤖 Manual AI generation requested for:', summary.videoTitle);
      console.log('📝 Video ID:', summary.videoId);
      
      // Call the AI summary API
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: summary.videoId,
          videoTitle: summary.videoTitle,
          channelName: summary.channelName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate AI summary');
      }

      const result = await response.json();
      console.log('✅ AI summary generated successfully:', result.summaryPoints);
      console.log('📊 Content source:', result.contentSource);
      
      // Update the summary points in the UI
      setCurrentSummaryPoints(result.summaryPoints);
      
      // Notify parent component if callback provided
      if (onSummaryUpdate) {
        onSummaryUpdate(summary.videoId, result.summaryPoints);
      }
      
      // Show success toast with content source info
      const sourceText = result.contentSource === 'transcript' ? 'from video transcript' : 'from video metadata';
      toast({
        title: "AI Summary Generated",
        description: `Summary created ${sourceText}!`,
      });
      
    } catch (error) {
      console.error('❌ Error generating AI summary:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate AI summary';
      setError(errorMessage);
      
      // Show error toast
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="flex flex-col h-full transition-shadow duration-300 hover:shadow-xl rounded-xl overflow-hidden">
      <div className="aspect-video w-full overflow-hidden">
        <Image
          src={summary.thumbnailUrl}
          alt={`Thumbnail for ${summary.videoTitle}`}
          width={600}
          height={400}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          data-ai-hint={summary.thumbnailHint}
        />
      </div>
      <CardHeader>
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 border">
            <AvatarImage src={summary.channelAvatarUrl} alt={summary.channelName} data-ai-hint={summary.channelAvatarHint} />
            <AvatarFallback>{summary.channelName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
             <CardTitle className="text-lg leading-tight font-semibold">{summary.videoTitle}</CardTitle>
             <CardDescription>{summary.channelName}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" className="border-b-0">
            <AccordionTrigger className="py-0">
              <h3 className="flex items-center font-semibold text-md">
                <ListChecks className="w-5 h-5 mr-2 text-primary" />
                AI Summary
              </h3>
            </AccordionTrigger>
            <AccordionContent>
              {error && (
                <div className="flex items-center gap-2 p-3 mb-3 text-sm text-red-600 bg-red-50 rounded-md">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
              <ul className="space-y-2 pt-2 pl-5 list-disc text-sm text-muted-foreground">
                {currentSummaryPoints.map((point, index) => (
                  <li key={index} className="leading-relaxed">{point}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{summary.publishedAt}</p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="h-8 px-3 text-xs"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            {isGenerating ? 'Generating...' : 'AI Summary'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-8 w-8 p-0"
          >
            <a
              href={`https://www.youtube.com/watch?v=${summary.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Watch on YouTube"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
