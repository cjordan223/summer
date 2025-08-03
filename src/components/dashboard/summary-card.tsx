import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { type Summary } from "@/lib/data";
import Image from "next/image";
import { ListChecks } from "lucide-react";

export function SummaryCard({ summary }: { summary: Summary }) {
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
              <ul className="space-y-2 pt-2 pl-5 list-disc text-sm text-muted-foreground">
                {summary.summaryPoints.map((point, index) => (
                  <li key={index} className="leading-relaxed">{point}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">{summary.publishedAt}</p>
      </CardFooter>
    </Card>
  );
}
