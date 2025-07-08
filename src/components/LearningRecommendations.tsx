import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, CheckCircle, AlertCircle, TrendingUp, BookOpen } from "lucide-react"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "@/components/ui/use-toast"

interface LearningRecommendation {
  id: string
  domain: string
  recommendation_type: string
  title: string
  description: string
  priority: number
  resource_links?: { title: string; url: string }[]
  is_completed: boolean
  created_at: string
}

interface LearningRecommendationsProps {
  recommendations: LearningRecommendation[]
  onUpdate: () => void
}

const getPriorityColor = (priority: number) => {
  switch (priority) {
    case 1: return "bg-red-100 text-red-800 border-red-200"
    case 2: return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case 3: return "bg-green-100 text-green-800 border-green-200"
    default: return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getPriorityLabel = (priority: number) => {
  switch (priority) {
    case 1: return "High Priority"
    case 2: return "Medium Priority"
    case 3: return "Low Priority"
    default: return "Priority"
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'skill_gap': return AlertCircle
    case 'next_level': return TrendingUp
    case 'review': return BookOpen
    default: return BookOpen
  }
}

export function LearningRecommendations({ recommendations, onUpdate }: LearningRecommendationsProps) {
  const [completingIds, setCompletingIds] = useState<Set<string>>(new Set())

  const markAsCompleted = async (id: string) => {
    setCompletingIds(prev => new Set(prev).add(id))
    
    try {
      const { error } = await supabase
        .from('learning_recommendations')
        .update({ is_completed: true })
        .eq('id', id)
      
      if (error) throw error
      
      toast({
        title: "Progress Updated!",
        description: "Recommendation marked as completed.",
      })
      
      onUpdate()
    } catch (error) {
      console.error('Error marking recommendation as completed:', error)
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive"
      })
    } finally {
      setCompletingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  if (recommendations.length === 0) {
    return (
      <Card className="bright-card">
        <CardContent className="p-8 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Recommendations Yet</h3>
          <p className="text-muted-foreground">
            Complete some assessments to get personalized learning recommendations!
          </p>
        </CardContent>
      </Card>
    )
  }

  const activeRecommendations = recommendations.filter(r => !r.is_completed)
  const completedRecommendations = recommendations.filter(r => r.is_completed)

  return (
    <div className="space-y-6">
      {activeRecommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Recommended for You
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRecommendations.map((recommendation) => {
              const TypeIcon = getTypeIcon(recommendation.recommendation_type)
              
              return (
                <Card key={recommendation.id} className="bright-card hover:scale-105 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="w-4 h-4 text-primary" />
                        <CardTitle className="text-sm font-semibold">
                          {recommendation.title}
                        </CardTitle>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={getPriorityColor(recommendation.priority)}
                      >
                        {getPriorityLabel(recommendation.priority)}
                      </Badge>
                    </div>
                    <Badge variant="secondary" className="w-fit">
                      {recommendation.domain}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {recommendation.description}
                    </p>
                    
                    {recommendation.resource_links && recommendation.resource_links.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-foreground">Resources:</h4>
                        {recommendation.resource_links.map((link, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => window.open(link.url, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3 mr-2" />
                            {link.title}
                          </Button>
                        ))}
                      </div>
                    )}
                    
                    <Button
                      onClick={() => markAsCompleted(recommendation.id)}
                      disabled={completingIds.has(recommendation.id)}
                      className="w-full"
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {completingIds.has(recommendation.id) ? "Updating..." : "Mark as Completed"}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {completedRecommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Completed ({completedRecommendations.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {completedRecommendations.map((recommendation) => (
              <Card key={recommendation.id} className="opacity-75 bg-muted/50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <h4 className="text-sm font-medium line-through">
                      {recommendation.title}
                    </h4>
                  </div>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {recommendation.domain}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}