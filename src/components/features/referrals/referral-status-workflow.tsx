'use client'

import { CheckCircle2, Circle, Clock, Stethoscope, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReferralStatus } from '@/types'

interface ReferralStatusWorkflowProps {
  status: ReferralStatus
  className?: string
}

const STAGES = [
  { id: 'referred', label: 'Sevk Edildi', icon: UserPlus, color: 'bg-blue-500' },
  { id: 'scheduled', label: 'Randevu Alındı', icon: Clock, color: 'bg-amber-500' },
  { id: 'treated', label: 'Tedavi Tamamlandı', icon: Stethoscope, color: 'bg-emerald-500' },
  { id: 'follow-up', label: 'Kontrol / Takip', icon: CheckCircle2, color: 'bg-purple-500' },
]

export function ReferralStatusWorkflow({ status, className }: ReferralStatusWorkflowProps) {
  const currentStageIndex = STAGES.findIndex(s => s.id === status)
  
  if (status === 'cancelled') {
    return (
      <div className={cn("flex items-center gap-2 text-destructive font-medium text-sm", className)}>
        <Circle className="h-4 w-4 fill-destructive" />
        İptal Edildi
      </div>
    )
  }

  return (
    <div className={cn("flex items-center w-full max-w-2xl mx-auto py-4", className)}>
      {STAGES.map((stage, index) => {
        const Icon = stage.icon
        const isCompleted = index < currentStageIndex
        const isCurrent = index === currentStageIndex
        
        return (
          <div key={stage.id} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center relative group">
              <div className={cn(
                "h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                isCompleted ? "bg-primary border-primary text-primary-foreground" : 
                isCurrent ? "bg-background border-primary text-primary ring-4 ring-primary/10" : 
                "bg-background border-muted text-muted-foreground"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-max text-center">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider transition-colors duration-300",
                  isCurrent ? "text-primary" : "text-muted-foreground"
                )}>
                  {stage.label}
                </span>
              </div>
            </div>
            
            {index < STAGES.length - 1 && (
              <div className="flex-1 mx-2 h-0.5 relative overflow-hidden bg-muted">
                <div 
                  className="absolute inset-0 bg-primary transition-all duration-500 ease-in-out"
                  style={{ 
                    width: isCompleted ? '100%' : '0%',
                    left: 0
                  }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
