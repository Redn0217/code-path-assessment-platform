import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Award, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface SkillProgress {
  domain: string
  skill_name: string
  current_level: number
  experience_points: number
  mastery_percentage: number
}

interface SkillProgressTreeProps {
  skills: SkillProgress[]
  className?: string
}

const getLevelColor = (level: number) => {
  if (level >= 5) return "bg-gradient-to-r from-purple-500 to-pink-500"
  if (level >= 4) return "bg-gradient-to-r from-blue-500 to-cyan-500"
  if (level >= 3) return "bg-gradient-to-r from-green-500 to-emerald-500"
  if (level >= 2) return "bg-gradient-to-r from-yellow-500 to-orange-500"
  return "bg-gradient-to-r from-gray-400 to-gray-500"
}

const getMasteryBadge = (percentage: number) => {
  if (percentage >= 90) return { label: "Expert", icon: Award, color: "bg-purple-100 text-purple-800" }
  if (percentage >= 75) return { label: "Advanced", icon: Star, color: "bg-blue-100 text-blue-800" }
  if (percentage >= 50) return { label: "Intermediate", icon: TrendingUp, color: "bg-green-100 text-green-800" }
  return { label: "Beginner", icon: TrendingUp, color: "bg-gray-100 text-gray-800" }
}

export function SkillProgressTree({ skills, className }: SkillProgressTreeProps) {
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.domain]) acc[skill.domain] = []
    acc[skill.domain].push(skill)
    return acc
  }, {} as Record<string, SkillProgress[]>)

  return (
    <div className={cn("space-y-6", className)}>
      {Object.entries(groupedSkills).map(([domain, domainSkills]) => (
        <Card key={domain} className="bright-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold bright-text-primary flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
              {domain}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {domainSkills.map((skill) => {
                const masteryBadge = getMasteryBadge(skill.mastery_percentage)
                const MasteryIcon = masteryBadge.icon
                
                return (
                  <div 
                    key={skill.skill_name}
                    className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card transition-all duration-300 hover:scale-105"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm text-foreground">
                          {skill.skill_name}
                        </h4>
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold",
                          getLevelColor(skill.current_level)
                        )}>
                          {skill.current_level}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Mastery</span>
                          <span className="font-medium">{skill.mastery_percentage.toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={skill.mastery_percentage} 
                          className="h-2"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge className={masteryBadge.color} variant="secondary">
                          <MasteryIcon className="w-3 h-3 mr-1" />
                          {masteryBadge.label}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {skill.experience_points} XP
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}