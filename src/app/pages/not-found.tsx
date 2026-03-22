import { motion } from "motion/react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Home, Skull } from "lucide-react";

export function NotFound() {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6 max-w-md"
      >
        <motion.div
          animate={{ 
            rotate: [0, 5, -5, 0],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <Skull className="h-24 w-24 mx-auto text-red-400" />
        </motion.div>
        
        <div className="space-y-2">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-semibold">Lost in the Dungeon</h2>
          <p className="text-muted-foreground">
            The path you seek does not exist in this realm. Perhaps you should return to safer ground.
          </p>
        </div>

        <Link to="/">
          <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Home className="h-4 w-4" />
            Return Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
