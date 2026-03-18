"use client" // Obligatorio para usar navigator y window

import { Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ShareProps {
  leagueId: string
  leagueName: string
}

export function ShareLeagueButton({ leagueId, leagueName }: ShareProps) {
  
  const handleShare = async () => {
    const shareText = `¡Unite a mi liga "${leagueName}" en HEADCOACH! 🏉\nArmá tu XV inicial y competí:`;
    const shareUrl = `${window.location.origin}/join?leagueId=${leagueId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'HEADCOACH - URBA Fantasy',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error compartiendo:', err);
      }
    } else {
      // Fallback para PC
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      alert("¡Link de invitación copiado!");
    }
  };

  return (
    <Button 
      onClick={handleShare}
      variant="outline"
      className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-xl gap-2 font-black italic uppercase text-[10px] tracking-widest"
    >
      <Share2 className="w-3 h-3" />
      Invitar Amigos
    </Button>
  );
}