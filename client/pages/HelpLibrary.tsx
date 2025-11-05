/**
 * Help Library Page
 *
 * Searchable, categorized help documentation for the entire application.
 * Accessible from the main navigation and as a contextual help resource.
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  ChevronRight,
  Tag,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import {
  HELP_CATEGORIES,
  searchHelpArticles,
  getCategoryById,
  getArticleById,
} from '@shared/tooltip-library';
import type { HelpArticle, HelpCategory } from '@shared/tooltip-library';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'getting-started': '🚀',
  'brand-setup': '🎨',
  'content-creation': '✏️',
  scheduling: '📅',
  analytics: '📊',
  teams: '👥',
  'white-label': '🛡️',
  agencies: '💼',
};

function HelpLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  // Search or filter articles
  const filteredArticles = useMemo(() => {
    let results: HelpArticle[] = [];

    if (searchQuery.trim()) {
      results = searchHelpArticles(searchQuery);
    } else if (selectedCategory) {
      const category = getCategoryById(selectedCategory);
      results = category?.articles || [];
    } else {
      results = HELP_CATEGORIES.flatMap((cat) => cat.articles);
    }

    return results;
  }, [searchQuery, selectedCategory]);

  const handleArticleClick = (article: HelpArticle) => {
    setSelectedArticle(article);
    // Scroll to article detail
    const element = document.getElementById('article-detail');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBackClick = () => {
    setSelectedArticle(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-slate-900" />
            <h1 className="text-4xl font-bold text-slate-900">Help Library</h1>
          </div>
          <p className="text-slate-600 text-lg">
            Everything you need to know about using Aligned AI
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-[300px_1fr] gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedCategory(null);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            {!searchQuery && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Categories</h3>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    'w-full text-left px-4 py-2 rounded-lg transition-colors',
                    selectedCategory === null
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  All Articles
                </button>
                {HELP_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      'w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2',
                      selectedCategory === category.id
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <span className="text-lg">{CATEGORY_ICONS[category.id]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {category.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {category.articles.length} articles
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Quick Links */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Pro Tips
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Check tooltips (?) while using the app</li>
                <li>• Use search for quick answers</li>
                <li>• Bookmark helpful articles</li>
                <li>• Email support@alignedai.com for help</li>
              </ul>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="space-y-6">
            {selectedArticle ? (
              <ArticleDetail article={selectedArticle} onBack={handleBackClick} />
            ) : (
              <ArticleList articles={filteredArticles} onArticleClick={handleArticleClick} searchQuery={searchQuery} />
            )}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-4 max-w-2xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Can't find what you're looking for?
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Our support team is here to help. Email us or start a chat in the app.
                </p>
                <div className="flex gap-3">
                  <a
                    href="mailto:support@alignedai.com"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Email Support
                  </a>
                  <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    Contact Us
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== ARTICLE LIST COMPONENT ====================

interface ArticleListProps {
  articles: HelpArticle[];
  onArticleClick: (article: HelpArticle) => void;
  searchQuery: string;
}

function ArticleList({ articles, onArticleClick, searchQuery }: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No articles found
        </h3>
        <p className="text-gray-600">
          Try adjusting your search terms or browse by category
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        {searchQuery
          ? `Found ${articles.length} article${articles.length === 1 ? '' : 's'} for "${searchQuery}"`
          : `Showing ${articles.length} article${articles.length === 1 ? '' : 's'}`}
      </div>

      <div className="grid gap-4">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onClick={() => onArticleClick(article)}
          />
        ))}
      </div>
    </div>
  );
}

// ==================== ARTICLE CARD COMPONENT ====================

interface ArticleCardProps {
  article: HelpArticle;
  onClick: () => void;
}

function ArticleCard({ article, onClick }: ArticleCardProps) {
  const category = HELP_CATEGORIES.find((c) => c.id === article.category);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">
              {CATEGORY_ICONS[article.category]}
            </span>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {category?.name}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {article.title}
          </h3>
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
            {article.content.split('\n')[0]}
          </p>
          {article.tags.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {article.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0 mt-1 transition-colors" />
      </div>
    </button>
  );
}

// ==================== ARTICLE DETAIL COMPONENT ====================

interface ArticleDetailProps {
  article: HelpArticle;
  onBack: () => void;
}

function ArticleDetail({ article, onBack }: ArticleDetailProps) {
  const category = HELP_CATEGORIES.find((c) => c.id === article.category);
  const relatedArticles = article.related
    .map((id) => {
      for (const cat of HELP_CATEGORIES) {
        const found = cat.articles.find((a) => a.id === id);
        if (found) return found;
      }
      return null;
    })
    .filter(Boolean) as HelpArticle[];

  return (
    <div id="article-detail" className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
      >
        ← Back to articles
      </button>

      {/* Article Header */}
      <div className="border-b pb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{CATEGORY_ICONS[article.category]}</span>
          <div>
            <span className="inline-block text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded mb-2">
              {category?.name}
            </span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {article.title}
        </h1>
        {article.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-3 py-1 rounded-full"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Article Content */}
      <div className="prose prose-sm max-w-none">
        {article.content.split('\n\n').map((paragraph, idx) => (
          <div key={idx} className="text-gray-700 whitespace-pre-wrap">
            {paragraph}
          </div>
        ))}
      </div>

      {/* Example Section */}
      {article.exampleText && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Example</h3>
          <p className="text-blue-800 text-sm whitespace-pre-wrap">
            {article.exampleText}
          </p>
        </div>
      )}

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Related Articles</h3>
          <div className="grid gap-3">
            {relatedArticles.map((relatedArticle) => (
              <button
                key={relatedArticle.id}
                onClick={() => {
                  // In a real app, this would navigate or update the displayed article
                  console.log('Navigate to:', relatedArticle.id);
                }}
                className="text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <div className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-medium text-gray-900 hover:text-blue-600">
                      {relatedArticle.title}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {relatedArticle.content.split('\n')[0]}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== UTILITY FUNCTION ====================

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export default HelpLibrary;
