import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

import cultusWork from '@/assets/gallery/cultus-work.png';
import engineRepair1 from '@/assets/gallery/engine-repair-1.png';
import workshop1 from '@/assets/gallery/workshop-1.png';
import workshop2 from '@/assets/gallery/workshop-2.png';
import workshopExterior from '@/assets/gallery/workshop-exterior.png';
import hondaCivic from '@/assets/gallery/honda-civic.png';
import toyotaCorolla from '@/assets/gallery/toyota-corolla.png';
import headGasket from '@/assets/gallery/head-gasket.png';

const galleryImages = [
  { src: cultusWork, title: 'Suzuki Cultus Maintenance', category: 'Maintenance' },
  { src: engineRepair1, title: 'Engine Repair Work', category: 'Engine' },
  { src: workshop1, title: 'Workshop Interior', category: 'Workshop' },
  { src: workshop2, title: 'Multiple Car Service', category: 'Workshop' },
  { src: workshopExterior, title: 'Workshop Entrance', category: 'Workshop' },
  { src: hondaCivic, title: 'Honda Civic Repair', category: 'Engine' },
  { src: toyotaCorolla, title: 'Toyota Corolla Service', category: 'Engine' },
  { src: headGasket, title: 'Head Gasket Guide', category: 'Educational' },
];

const categories = ['All', 'Engine', 'Maintenance', 'Workshop', 'Educational'];

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalImage, setModalImage] = useState<number | null>(null);

  const filteredImages = selectedCategory === 'All' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory);

  const openModal = (index: number) => {
    setModalImage(index);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalImage(null);
    document.body.style.overflow = 'auto';
  };

  const navigateModal = (direction: 'prev' | 'next') => {
    if (modalImage === null) return;
    const newIndex = direction === 'prev' 
      ? (modalImage - 1 + filteredImages.length) % filteredImages.length
      : (modalImage + 1) % filteredImages.length;
    setModalImage(newIndex);
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-secondary via-background to-secondary">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Our <span className="text-gradient">Gallery</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              See our work in action — real repairs, real results
            </p>
          </div>
        </div>
      </section>

      {/* Filter Buttons */}
      <section className="py-8 bg-card border-y border-border">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground shadow-glow'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image, index) => (
              <div
                key={index}
                onClick={() => openModal(index)}
                className="group relative overflow-hidden rounded-xl cursor-pointer card-hover"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full mb-2">
                      {image.category}
                    </span>
                    <h3 className="text-white font-semibold">{image.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {modalImage !== null && (
        <div className="gallery-modal-backdrop" onClick={closeModal}>
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); navigateModal('prev'); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); navigateModal('next'); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>

          <div 
            className="max-w-5xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={filteredImages[modalImage].src}
              alt={filteredImages[modalImage].title}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            <div className="text-center mt-4">
              <h3 className="text-white text-xl font-semibold">
                {filteredImages[modalImage].title}
              </h3>
              <span className="text-white/70">
                {modalImage + 1} / {filteredImages.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Gallery;
