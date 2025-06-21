const About = ({ user }) => {
  return (
    <div className='about-section'>
      <h2>About</h2>
      <div className='info-item'>
        <i className='fas fa-map-marker-alt'></i>
        <span>{user.location}</span>
      </div>
      <div className='info-item'>
        <i className='fas fa-briefcase'></i>
        <span>{user.work}</span>
      </div>
      <div className='info-item'>
        <i className='fas fa-graduation-cap'></i>
        <span>{user.education}</span>
      </div>
    </div>
  );
};

export default About;
