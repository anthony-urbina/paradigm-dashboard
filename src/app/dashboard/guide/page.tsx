import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BookOpen, FileText, Video, ChevronRight, ExternalLink } from "lucide-react";

const categories = [
  {
    title: "Getting Started",
    icon: BookOpen,
    articles: [
      { title: "How to set up your agent profile", type: "Article", readTime: "3 min" },
      { title: "Understanding your dashboard", type: "Article", readTime: "5 min" },
      { title: "Entering your first policy", type: "Article", readTime: "4 min" },
      { title: "Setting annual and monthly goals", type: "Article", readTime: "3 min" },
    ],
  },
  {
    title: "Products & Carriers",
    icon: FileText,
    articles: [
      { title: "Mutual of Omaha — Term Life overview", type: "Article", readTime: "6 min" },
      { title: "North American IUL — product guide", type: "PDF", readTime: "12 min" },
      { title: "American Equity FIA — sales strategy", type: "Article", readTime: "8 min" },
      { title: "Final expense product comparison", type: "Article", readTime: "5 min" },
      { title: "Medicare Supplement — state availability", type: "Article", readTime: "4 min" },
    ],
  },
  {
    title: "Sales Process",
    icon: ChevronRight,
    articles: [
      { title: "The Paradigm 5-step sales process", type: "Article", readTime: "7 min" },
      { title: "Handling common objections", type: "Article", readTime: "6 min" },
      { title: "Needs analysis — best practices", type: "Article", readTime: "5 min" },
      { title: "Closing techniques for life insurance", type: "Article", readTime: "8 min" },
    ],
  },
  {
    title: "Training Videos",
    icon: Video,
    articles: [
      { title: "New agent orientation (60 min)", type: "Video", readTime: "60 min" },
      { title: "Product training — IUL deep dive", type: "Video", readTime: "45 min" },
      { title: "Recruiting your first agent", type: "Video", readTime: "30 min" },
      { title: "Contest strategy and trip qualifications", type: "Video", readTime: "20 min" },
    ],
  },
  {
    title: "Compliance & Licensing",
    icon: FileText,
    articles: [
      { title: "CE requirements by state", type: "Article", readTime: "4 min" },
      { title: "E&O insurance — what's required", type: "Article", readTime: "3 min" },
      { title: "Anti-money laundering (AML) training", type: "Article", readTime: "10 min" },
      { title: "Do Not Call compliance guide", type: "Article", readTime: "5 min" },
    ],
  },
];

const typeColor: Record<string, string> = {
  Article: "bg-gray-100 text-gray-700",
  PDF: "bg-black text-white",
  Video: "bg-[#898989] text-white",
};

export default function GuidePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Guide</h1>
        <p className="text-muted-foreground">Resources, training, and product knowledge base.</p>
      </div>

      {/* Search */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search articles, videos, and guides..." className="pl-9 h-11 text-sm" />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="pdfs">PDFs</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="space-y-6">
            {categories.map((cat) => (
              <div key={cat.title}>
                <div className="flex items-center gap-2 mb-3">
                  <cat.icon className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">{cat.title}</h2>
                </div>
                <Card>
                  <CardContent className="p-0 divide-y">
                    {cat.articles.map((article) => (
                      <div
                        key={article.title}
                        className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Badge className={`text-xs ${typeColor[article.type] ?? "bg-gray-100 text-gray-700"}`}>
                            {article.type}
                          </Badge>
                          <span className="text-sm font-medium">{article.title}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-muted-foreground hidden sm:block">{article.readTime}</span>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="articles" className="mt-4">
          <Card>
            <CardContent className="p-0 divide-y">
              {categories.flatMap((c) => c.articles).filter((a) => a.type === "Article").map((article) => (
                <div
                  key={article.title}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge className="text-xs bg-gray-100 text-gray-700">Article</Badge>
                    <span className="text-sm font-medium">{article.title}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground">{article.readTime}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.flatMap((c) => c.articles).filter((a) => a.type === "Video").map((video) => (
              <Card key={video.title} className="cursor-pointer hover:border-foreground/20 transition-colors">
                <CardContent className="pt-5">
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-3">
                    <Video className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-sm font-semibold">{video.title}</CardTitle>
                  <CardDescription className="text-xs mt-1">{video.readTime}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pdfs" className="mt-4">
          <Card>
            <CardContent className="p-0 divide-y">
              {categories.flatMap((c) => c.articles).filter((a) => a.type === "PDF").map((pdf) => (
                <div
                  key={pdf.title}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{pdf.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{pdf.readTime}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
