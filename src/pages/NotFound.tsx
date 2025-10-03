import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const NotFound = () => {
  return (
    <Container>
      <PageHeader title="Page Not Found" showBack />
      
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="text-6xl mb-4">🚜</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">404</h1>
          <p className="text-muted-foreground mb-6">
            Oops! This page doesn't exist in the farm.
          </p>
        </motion.div>
        
        <Button
          variant="farm"
          size="lg"
          onClick={() => window.location.href = '/'}
        >
          🏠 Return Home
        </Button>
      </div>
      
      <BottomNavigation />
    </Container>
  );
};

export default NotFound;