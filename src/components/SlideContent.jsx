const SlideContent = ({ slide }) => {
  return (
    <div className="slider-content">
      <div className="slide-title">
        <h1>{slide.title}</h1>
      </div>
      <div className="slide-description">
        <p>{slide.description}</p>
        <div className="slide-info">
          <p>Type. {slide.type}</p>
          <p>Field. {slide.field}</p>
          <p>Date. {slide.date}</p>
        </div>
      </div>
    </div>
  );
};

export default SlideContent;
