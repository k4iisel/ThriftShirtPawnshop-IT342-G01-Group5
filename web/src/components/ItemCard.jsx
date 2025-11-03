import '../styles/ItemCard.css';

function ItemCard({ item, onClick }) {
  const handleBuyClick = (e) => {
    e.stopPropagation(); // Prevent triggering the card's onClick
    alert(`Purchase initiated for ${item.name}!`);
  };

  return (
    <div className="item-card" onClick={onClick}>
      <div className="item-card-buy-container">
        <button 
          className="buy-now-button"
          onClick={handleBuyClick}
        >
          Buy Now
        </button>
      </div>
      <div className="item-card-image-container">
        <img src={item.image} alt={item.name} className="item-card-image" />
      </div>
      <div className="item-card-info">
        <h3 className="item-card-name">{item.name}</h3>
        <div className="price-container">
          <p className="item-card-price">{item.price}</p>
        </div>
        <span className="item-card-condition">{item.condition}</span>
      </div>
    </div>
  );
}

export default ItemCard;
