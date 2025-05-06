import React, { useState, useEffect, useContext } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Languages, Loader2 } from "lucide-react";
import { ResourceCard } from "@/components/ResourceCard";
import { ServiceCard } from "@/components/ServiceCard";
import { LanguageContext } from "@/contexts/LanguageContext";

interface SearchResult {
  resources: any[];
  services: any[];
  totalResults: number;
  executionTime: number;
}

const languageOptions = [
  { value: "auto", label: "Auto-Detect" },
  { value: "ko", label: "Korean (한국어)" },
  { value: "en", label: "English" },
  { value: "ja", label: "Japanese (日本語)" },
  { value: "zh", label: "Chinese (中文)" },
  { value: "es", label: "Spanish (Español)" },
];

const SearchDemo: React.FC = () => {
  const { language: contextLanguage } = useContext(LanguageContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [language, setLanguage] = useState("auto");
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Demo search queries based on the selected language
  const demoQueries: Record<string, string[]> = {
    ko: ["프로그래밍", "소프트웨어 개발", "3D 프린팅", "엔지니어링"],
    en: ["programming", "software development", "3D printing", "engineering"],
    ja: ["プログラミング", "ソフトウェア開発", "3Dプリンティング", "エンジニアリング"],
    zh: ["编程", "软件开发", "3D打印", "工程"],
    es: ["programación", "desarrollo de software", "impresión 3D", "ingeniería"],
    auto: ["software", "engineering", "printing", "development"],
  };

  // Translations for UI elements
  const translations: Record<string, Record<string, string>> = {
    pageTitle: {
      ko: "다국어 검색 데모",
      en: "Multilingual Search Demo",
      ja: "多言語検索デモ",
      zh: "多语言搜索演示",
      es: "Demostración de Búsqueda Multilingüe",
    },
    searchPlaceholder: {
      ko: "검색어 입력...",
      en: "Enter search query...",
      ja: "検索キーワードを入力...",
      zh: "输入搜索查询...",
      es: "Ingresar consulta de búsqueda...",
    },
    searchButton: {
      ko: "검색",
      en: "Search",
      ja: "検索",
      zh: "搜索",
      es: "Buscar",
    },
    suggestedQueries: {
      ko: "추천 검색어:",
      en: "Suggested Queries:",
      ja: "おすすめクエリ:",
      zh: "建议的查询:",
      es: "Consultas Sugeridas:",
    },
    all: {
      ko: "모두",
      en: "All",
      ja: "すべて",
      zh: "全部",
      es: "Todos",
    },
    resources: {
      ko: "자원",
      en: "Resources",
      ja: "リソース",
      zh: "资源",
      es: "Recursos",
    },
    services: {
      ko: "서비스",
      en: "Services",
      ja: "サービス",
      zh: "服务",
      es: "Servicios",
    },
    noResults: {
      ko: "검색 결과가 없습니다",
      en: "No results found",
      ja: "結果が見つかりません",
      zh: "未找到结果",
      es: "No se encontraron resultados",
    },
    searchStats: {
      ko: "결과 {total}개, 소요 시간: {time}ms",
      en: "{total} results in {time}ms",
      ja: "{total}件の結果、所要時間: {time}ms",
      zh: "{total}个结果，用时: {time}ms",
      es: "{total} resultados en {time}ms",
    },
  };

  // Helper function to get translated text
  const getTranslation = (key: string): string => {
    const currentLanguage = contextLanguage || "en";
    return translations[key]?.[currentLanguage] || translations[key]?.["en"] || key;
  };

  // Function to perform the search
  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&lang=${language}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  // Handle demo query click
  const handleDemoQueryClick = (query: string) => {
    setSearchQuery(query);
    // Automatically search when a demo query is clicked
    setTimeout(() => {
      performSearch();
    }, 100);
  };

  // Format the search statistics text
  const formatSearchStats = () => {
    if (!searchResults) return "";
    const stat = getTranslation("searchStats");
    return stat
      .replace("{total}", searchResults.totalResults.toString())
      .replace("{time}", searchResults.executionTime.toString());
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">{getTranslation("pageTitle")}</h1>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <div className="flex-grow">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={getTranslation("searchPlaceholder")}
              className="w-full"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Languages className="mr-2 h-4 w-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="md:w-32" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            {getTranslation("searchButton")}
          </Button>
        </div>
      </form>

      {/* Suggested Queries */}
      <Card className="mb-8">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            {getTranslation("suggestedQueries")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {demoQueries[language === "auto" ? "auto" : language].map((query, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleDemoQueryClick(query)}
              >
                {query}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {formatSearchStats()}
            </h2>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                {getTranslation("all")} ({searchResults.totalResults})
              </TabsTrigger>
              <TabsTrigger value="resources">
                {getTranslation("resources")} ({searchResults.resources.length})
              </TabsTrigger>
              <TabsTrigger value="services">
                {getTranslation("services")} ({searchResults.services.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {searchResults.totalResults === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  {getTranslation("noResults")}
                </div>
              ) : (
                <>
                  {searchResults.resources.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-medium mb-4">{getTranslation("resources")}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.resources.map((resource) => (
                          <ResourceCard
                            key={resource.id}
                            resource={{
                              id: resource.id,
                              title: resource.title,
                              description: resource.description,
                              category: resource.category,
                              tags: resource.tags,
                              imageUrl: resource.image_url,
                              thumbnailUrl: resource.thumbnail_url,
                              downloadCount: resource.download_count,
                              createdAt: resource.created_at,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.services.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-4">{getTranslation("services")}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.services.map((service) => (
                          <ServiceCard
                            key={service.id}
                            service={{
                              id: service.id,
                              title: service.title,
                              description: service.description,
                              serviceType: service.service_type,
                              tags: service.tags,
                              imageUrl: service.image_url,
                              location: service.location,
                              rating: service.rating,
                              ratingCount: service.rating_count,
                              isRemote: service.is_remote,
                              pricePerHour: service.hourly_rate,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="resources">
              {searchResults.resources.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  {getTranslation("noResults")}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.resources.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      resource={{
                        id: resource.id,
                        title: resource.title,
                        description: resource.description,
                        category: resource.category,
                        tags: resource.tags,
                        imageUrl: resource.image_url,
                        thumbnailUrl: resource.thumbnail_url,
                        downloadCount: resource.download_count,
                        createdAt: resource.created_at,
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="services">
              {searchResults.services.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  {getTranslation("noResults")}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.services.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={{
                        id: service.id,
                        title: service.title,
                        description: service.description,
                        serviceType: service.service_type,
                        tags: service.tags,
                        imageUrl: service.image_url,
                        location: service.location,
                        rating: service.rating,
                        ratingCount: service.rating_count,
                        isRemote: service.is_remote,
                        pricePerHour: service.hourly_rate,
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default SearchDemo;