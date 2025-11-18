import { useState, useRef, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import ItemCard from '../components/ItemCard';
import ItemModal from '../components/ItemModal';
import '../styles/Browse.css';
import '../styles/ItemModal.css';

function Browse() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pressTimer = useRef(null);
  
  const [items] = useState([
    { id: 1, name: 'Pedro Shirt', price: '₱350', condition: 'Excellent', image: 'https://via.placeholder.com/300x300?text=Pedro+Shirt' },
    { id: 2, name: 'Dr.Dre Vintage', price: '₱500', condition: 'Good', image: 'https://via.placeholder.com/300x300?text=Dr.Dre+Vintage' },
    { id: 3, name: 'Pedro Shirt', price: '₱350', condition: 'Excellent', image: 'https://via.placeholder.com/300x300?text=Pedro+Shirt' },
    { id: 4, name: 'Dr.Dre Vintage', price: '₱500', condition: 'Good', image: 'https://via.placeholder.com/300x300?text=Dr.Dre+Vintage' },
    { id: 5, name: 'Nirvana Shirt', price: '₱450', condition: 'Excellent', image: 'https://via.placeholder.com/300x300?text=Nirvana+Shirt' },
    { id: 6, name: 'All Eyes On Me', price: '₱600', condition: 'Good', image: 'https://via.placeholder.com/300x300?text=All+Eyes+On+Me' },
    { id: 7, name: 'Nirvana Shirt', price: '₱450', condition: 'Excellent', image: 'https://via.placeholder.com/300x300?text=Nirvana+Shirt' },
    { id: 8, name: 'All Eyes On Me', price: '₱600', condition: 'Good', image: 'https://via.placeholder.com/300x300?text=All+Eyes+On+Me' },
  ]);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle press and hold
  const startPressTimer = (item) => {
    pressTimer.current = setTimeout(() => {
      setSelectedItem(item);
      setIsModalOpen(true);
    }, 1500); // 1.5 seconds hold
  };

  const clearPressTimer = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }, []);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
      }
    };
  }, []);

  const handleBuy = () => {
    alert(`Purchase initiated for ${selectedItem.name}!`);
    setIsModalOpen(false);
  };

  return (
    <div className="browse-page">
      <Navbar />
      
      <div className="browse-content">
        <Header />
        
        <div className="browse-section">
          <div className="browse-title">
            <h2>Browse Items</h2>
            <p>Forfeited items for sale - Shop for something that fits your style</p>
          </div>

          {/* Search Bar */}
          <div className="search-container">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search for items"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Items Grid */}
          <div className="browse-grid">
            {filteredItems.map(item => (
              <div 
                key={item.id}
                onMouseDown={() => startPressTimer(item)}
                onMouseUp={clearPressTimer}
                onMouseLeave={clearPressTimer}
                onTouchStart={() => startPressTimer(item)}
                onTouchEnd={clearPressTimer}
              >
                <ItemCard 
                  item={item}
                  onClick={() => console.log('Item clicked:', item.id)}
                />
              </div>
            ))}
          </div>

          {isModalOpen && selectedItem && (
            <ItemModal 
              item={selectedItem}
              onClose={() => setIsModalOpen(false)}
              onBuy={handleBuy}
            />
          )}

          {filteredItems.length === 0 && (
            <div className="no-results">
              <p>No items found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Browse;
