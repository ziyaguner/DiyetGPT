import { Button } from '../../components/ui/button';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-6 text-center"
    >
      <div className="space-y-6 max-w-md">
        <div className="space-y-3">
          <h1 className="text-8xl font-bold text-blue-600">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800">Sayfa Bulunamadı</h2>
          <p className="text-muted-foreground">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <a href="/">Anasayfaya Dön</a>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Geri Dön
          </Button>
        </div>
      </div>
    </motion.div>
  );
}