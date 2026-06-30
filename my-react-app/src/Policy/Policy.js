import React from 'react';
import "./Policy.css";

const Policy = () => {
  return (
    <div className="policyMainContainer">
      <div className="policyContainer">
        <h1>Our Policy</h1>
        
        <section className="policySection">
          <h2>1. Platform Mission</h2>
          <p>
            Tutors Academy acts as a decentralized medium facilitating direct connections 
            between parents/students and qualified tutors. We prioritize educational access 
            and do not charge matching fees or commissions for connecting parties.
          </p>
        </section>

        <section className="policySection">
          <h2>2. Safety & Safety Conduct</h2>
          <p>
            We care deeply about a safe learning environment. Parents are strongly advised 
            to have an adult present or nearby during all tutoring sessions. Tutors must 
            maintain strict professional boundaries and respect the family's home environment.
          </p>
        </section>

        <section className="policySection">
          <h2>3. Secure Communication</h2>
          <p>
            All platform coordination, initial contact, and messages should occur through 
            our secure messaging system. This helps protect personal contact details and 
            keeps a record of communication history.
          </p>
        </section>

        <section className="policySection">
          <h2>4. Dispute Resolution</h2>
          <p>
            Any scheduling, payment, or tutoring disputes must be resolved directly between 
            the parent and the tutor. Tutors Academy does not govern financial transactions 
            or individual session content.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Policy;
