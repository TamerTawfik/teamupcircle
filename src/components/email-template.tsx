import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
}) => (
  <div>
    <h1>Welcome, {firstName}!</h1>
    <p>
      Thank you for signing up for Teamup Circle. We&rsquo;re excited to have
      you on board!
    </p>
    <p>
      Ready to connect? Head over to the{" "}
      <a href="https://teamupcircle.com/members">Members page</a> to meet fellow
      developers in our community.
    </p>
    <p>
      Looking for a project to contribute to? Check out the{" "}
      <a href="https://teamupcircle.com/discover-projects">Projects page</a> and
      find your next challenge!
    </p>
  </div>
);
