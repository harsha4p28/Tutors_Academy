import React, { useState } from "react";
import "./Home.css";
import ParentSignup from "../Signup/ParentSignup";
import TutorSignup from "../Signup/TutorSignup";

const Home = () => {
  const [isParentSignupVisible, setIsParentSignupVisible] = useState(true);

  return (
    <div className="HomeContainer">
      <div className="Image">
        <div className="MainText">
          <h2>
            <span className="title">Welcome to Tutors Academy!</span>
            <br />
            <span className="subtitle"> -where Learning Meets Opportunity</span>
          </h2>
        </div>{" "}
      </div>
      <div className="TextCard">
        <div className="SideText">
          <h3>Connecting Parents and Tutors for a Brighter Future</h3>
          <p>
            At Tutors Academy, we aim to revolutionize the learning experience
            by creating an easy and effective way for parents and students to
            connect with qualified tutors. Whether you're a parent seeking extra
            help for your child or a tutor looking to share your expertise, our
            platform is here to bridge the gap.
          </p>
        </div>
        <div className="MoreInfo">
          <div className="InfoParent">
            You can find experienced, passionate tutors specializing in a
            variety of subjects and grade levels, from elementary school all the
            way through college courses. With a user-friendly interface, it’s
            easy to browse tutor profiles, read reviews, and find the perfect
            match for your child’s learning needs.
          </div>
          <div className="InfoTutor">
            If you're a tutor ready to help students succeed, our platform
            offers you the opportunity to connect with parents who are looking
            for your expertise. With flexible hours, the ability to set your
            rates, and a secure platform, you can build your tutoring career on
            your own terms.
          </div>
        </div>
      </div>
      <div className="count">
        <span className="tutors">100+ Tutors</span>
        <span className="students">500+ Students</span>
      </div>
      <div className="signUp">
        <div className="toggle-buttons">
          <button
            type="button" 
            className={`ParentSignupButton ${isParentSignupVisible ? "active" : ""}`}
            onClick={() => setIsParentSignupVisible(true)}
          >
            Parent
          </button>
          <button
            type="button"
            className={`TutorSignupButton ${!isParentSignupVisible ? "active" : ""}`}
            onClick={() => setIsParentSignupVisible(false)}
          >
            Tutor{" "}
          </button>
        </div>
        {isParentSignupVisible ? (
          <ParentSignup />
        ) : (
          <TutorSignup />
        )}
      </div>
      <div className="instructions">
        <div className="instruction-parent">
          <h3>Parent Instructions</h3>
          <li>Ensure a safe environment by securing valuables during tutoring sessions.</li>
          <li>Be present or nearby during the session for safety.</li>
          <li>Avoid overloading your child with excessive tutoring.</li>
          <li>Provide a quiet space for the tutor to teach without distractions.</li>
          <li>Communicate any safety concerns to the tutor.</li>
          <li>Share house rules with the tutor in advance.</li>
          <li>Disclose relevant information about your child’s needs to the tutor.</li>
          <li>Maintain professionalism and respect the tutor’s role.</li>
        </div>
        <div className="instruction-tutor">
          <h3>Tutor Instructions</h3>
          <li>Dress professionally and behave appropriately when tutoring.</li>
          <li>Avoid touching personal items like jewelry or electronics.</li>
          <li>Maintain clear boundaries in all interactions with the family.</li>
          <li>Respect the home environment and minimize distractions.</li>
          <li>Use safe, secure technology for online tutoring.</li>
          <li>Keep all student information confidential.</li>
          <li>Clarify payment terms and cancellation policies beforehand.</li>
          <li>Keep communication professional and respectful at all times.</li>
        </div>  
      </div>
      <div className="how">
        <h2>How It Works?</h2>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Create Profile</h3>
            <p>Sign up in seconds. Tutors showcase credentials and subjects, parents register learning goals and details.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Search & Match</h3>
            <p>Use our advanced multi-field search engine to find matches based on syllabus, location, grade level, or subject.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Connect Instantly</h3>
            <p>Start a direct conversation via our secure dashboard chat interface to align scheduling and start learning.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
