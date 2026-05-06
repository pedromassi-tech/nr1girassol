import { motion } from "framer-motion";
import { Calculator } from "lucide-react";
import Navbar from "@/components/Navbar";
import RiskCalculator from "@/components/RiskCalculator";

const CalculatorPage = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      
      <main className="pt-24 pb-14 md:pt-32 md:pb-28 px-4 sm:px-8 bg-muted/20 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-full px-4 py-1.5 mb-4">
                <Calculator className="h-3.5 w-3.5 text-secondary" />
                <span className="text-secondary text-xs font-bold tracking-wide uppercase">Simulador de Impacto</span>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary leading-tight">
                Calculadora de Risco Real
              </h1>
              <p className="text-muted-foreground text-sm md:text-base mt-2 max-w-2xl mx-auto">
                Simule o impacto financeiro da não adequação e veja sua faixa de risco real baseada em dados reais da sua organização.
              </p>
            </div>
            
            <div className="bg-card rounded-2xl sm:rounded-3xl border border-border/60 p-4 sm:p-8 md:p-10 shadow-lg shadow-primary/5">
              <RiskCalculator />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default CalculatorPage;
