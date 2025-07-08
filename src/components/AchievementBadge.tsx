import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: string
  points: number
  badge_color: string
  earned_at?: string
  progress?: number
}

interface AchievementBadgeProps {
  achievement: Achievement
  isEarned: boolean
  className?: string
}

export function AchievementBadge({ achievement, isEarned, className }: AchievementBadgeProps) {
  return (
    <Card 
      className={cn(
        "transition-all duration-300 hover:scale-105 cursor-pointer",
        isEarned 
          ? "bright-card border-2" 
          : "bg-muted/50 border-muted-foreground/20",
        className
      )}
      style={isEarned ? { borderColor: achievement.badge_color } : {}}
    >
      <CardContent className="p-4 text-center">
        <div className="mb-2">
          <div 
            className={cn(
              "text-3xl mb-2 transition-all duration-300",
              isEarned ? "animate-pulse" : "grayscale opacity-50"
            )}
          >
            {achievement.icon}
          </div>
          <h3 className={cn(
            "font-semibold text-sm",
            isEarned ? "text-foreground" : "text-muted-foreground"
          )}>
            {achievement.name}
          </h3>
        </div>
        
        <p className={cn(
          "text-xs mb-3",
          isEarned ? "text-muted-foreground" : "text-muted-foreground/70"
        )}>
          {achievement.description}
        </p>

        <div className="space-y-2">
          <Badge 
            variant={isEarned ? "default" : "secondary"}
            className="text-xs"
            style={isEarned ? { backgroundColor: achievement.badge_color } : {}}
          >
            {achievement.category}
          </Badge>
          
          {achievement.progress !== undefined && achievement.progress < 100 && (
            <div className="space-y-1">
              <Progress value={achievement.progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {achievement.progress}% Complete
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-center gap-1 text-xs">
            <span className="font-medium">{achievement.points}</span>
            <span className="text-muted-foreground">pts</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}