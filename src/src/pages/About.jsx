import React from 'react'

const About = () => {
  return (
    <div className="about-page">
      <h1 className="lg-heading">
        About <span className="text-secondary">Me</span>
      </h1>
      <h2 className="sm-heading">Let me tell you a few things...</h2>
      
      <div className="about-info">
        <div className="bio-image-container">
          <img src="img/portrait.jpg" alt="Tiago Santos Portrait" className="bio-image" />
        </div>

        <div className="bio">
          <h3 className="text-secondary">BIO</h3>
          <p>
           I'm a multidisciplinary designer and digital artist from Braga, Portugal, with a Master's degree in Technology and Digital Art from the University of Minho. My passion for creativity began with a desire to capture and celebrate the beauty of culture, people, and visual storytelling through design.

I specialize in animation, illustration, and drawing, with additional expertise in typography, photo retouching, photo manipulation, and video editing. Over the years, I've worked with clients on branding, logo design, packaging, publications, signage, and visual identity projects, helping bring their ideas to life through thoughtful and engaging design.

Explore my portfolio to see a selection of professional and personal projects that reflect my skills, creativity, and dedication to visual communication.
          </p>
        </div>
      </div>

      <div className="jobs-grid">
        <div className="job-card">
          <h3>Designer</h3>
          <h6>Graphics</h6>
          <p>
           My journey in graphic design began with a three-year Art and Design course in Coimbra, where I developed a strong foundation in visual communication, typography, and creative problem-solving.

As a graphic designer and artist, I work with both text and imagery to create clear, engaging, and effective visual experiences. I carefully consider typography, layout, color, composition, and visual hierarchy to ensure that every design communicates its message with impact. Whether designing for print or digital platforms, I focus on creating balanced and cohesive designs that connect with their audience.

I also enjoy transforming complex information into accessible visual graphics and infographics, using design to simplify ideas and enhance understanding.

In 2018, I worked at Rolsaco, where I was responsible for designing a variety of marketing and corporate materials, including business cards, flyers, posters, and other promotional assets. This experience strengthened my practical design skills and deepened my understanding of branding, print production, and client-focused communication.          </p>
        </div>

        <div className="job-card">
          <h3>Programmer</h3>
          <h6>Front End Developer</h6>
          <p>
          As part of the Master's Programme in Technology and Digital Art (MTAD) at the University of Minho, I participated in the Media & Digital Art Exhibition at the Couros Campus in Guimarães.

The exhibition featured student-created installations and projects exploring interactivity, electronic music, sound design, 3D animation, game design, sensor technologies, and computer vision. The event showcased the creative and technical skills developed throughout the programme and provided a platform for presenting innovative digital art to the public.
          </p>
          <p style={{ marginTop: '1rem' }}>
            <a
              href="http://enginews76.weebly.com/alunos-do-mestrado-em-tecnologia-e-arte-digital-expotildeem-as-suas-obras.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit the exhibition site
            </a>
          </p>
        </div>

        <div className="job-card">
          <h3>UX/UI Designer</h3>
          <h6>User Interaction</h6>
          <p>
            My first experience in UX/UI design began during my Master's Programme in Technology and Digital Art, where I developed skills in user-centered design, interface prototyping, and usability principles. Throughout the programme, I created user interface mockups, conducted persona research, and designed user experiences for mobile applications, focusing on creating intuitive and engaging digital products.

In 2017, I completed an  internship at Instituto Stela in Brazil, where I worked on the design and prototyping of MyRate, a mobile application for Android and macOS. The project was developed as an extension of the company's platform, which aimed to connect universities and employers by helping them identify and recruit the most suitable candidates.

My responsibilities included user experience planning, interface design, wireframing, and prototyping, ensuring that the application provided a clear, accessible, and user-friendly experience. This opportunity allowed me to apply UX research methods and design thinking principles in a professional environment while collaborating on a real-world digital product.
          </p>
        </div>
      </div>
    </div>
  )
}

export default About
