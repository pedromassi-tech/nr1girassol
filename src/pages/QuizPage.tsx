import { motion } from "framer-motion";
import { ClipboardCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Quiz from "@/components/Quiz";

const QuizPage = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      
      <main className="pt-24 pb-14 md:pt-32 md:pb-28 px-4 sm:px-8 bg-muted/30 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-full px-4 py-1.5 mb-4">
                <ClipboardCheck className="h-3.5 w-3.5 text-secondary" />
                <span className="text-secondary text-xs font-bold tracking-wide uppercase">Diagnóstico NR-1</span>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary leading-tight">
                Quiz NR-1 na Prática
              </h1>
              <p className="text-muted-foreground text-sm md:text-base mt-2 max-w-xl mx-auto">
                Descubra se a sua gestão de riscos psicossociais está só no papel ou já virou governança de verdade.
              </p>
            </div>
            
            <div className="bg-card rounded-2xl sm:rounded-3xl border border-border/60 p-4 sm:p-8 md:p-10 shadow-lg shadow-primary/5">
              <Quiz />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default QuizPage;
