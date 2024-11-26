import React, { useState } from "react";
import axios from "axios";

function Info({ health, budget, image, store, switchPage }) {
  const [information, setInformation] = useState([]);
  const [loading, setLoading] = useState(false);

  const healthPrompt = `If the image does not depict food, respond only with: "Unrecognized food." For food, provide exactly:
- Three health benefits (3-5 words each).
- Three health drawbacks (3-5 words each).
Do not add any extra text, introductions, or conclusions. Seperate the sections with a header for advantages and disadvantages`;
  let budgetPrompt = `If the image does not depict food, respond only with: "Unrecognized food." For food, state:
- Is this product within their budget: ${budget}? 
- Is this product generally within budget?
Answer in one readable sentence like: This product is within budget.`;
let alternativesPrompt = `
list:
- 1-3 specific, in-store alternatives for this product, list the brand and name of the product, considering:
  - Its health benefits/drawbacks.
  - The user's health preference: ${health}.
  - The user's budget is: ${budget}.
  - The user is in ${store}
Each alternative should be brief (3-5 words). Do not add any extra text, introductions, or conclusions. If the image is not food, respond with: "Unrecognized food."
`;

  async function getInfo() {
    setLoading(true);
    try {
      const response1 = await axios.post("https://smartshoppernov22.onrender.com/api/get-info", {
        prompt: healthPrompt,
        image: image,
        path: './images/image.png',
        delete: false
      });
      if(response1.data.information == "Unrecognized food.") {
        budgetPrompt="Say: Unrecognized food"
        alternativesPrompt="Say: Unrecognized food"
      }
      const response2 = await axios.post("https://smartshoppernov22.onrender.com/api/get-info", {
        prompt: budgetPrompt,
        image: image,
        path: './images/image.png',
        delete: false
      });
      const response3 = await axios.post("https://smartshoppernov22.onrender.com/api/get-info", {
        prompt: alternativesPrompt,
        image: image,
        path: './images/image.png',
        delete: true
      });

      setInformation([
        { information: response1.data.information || "No health information" },
        { information: response2.data.information || "No budget information" },
        { information: response3.data.information || "No alternatives" },
      ]);
    } catch (error) {
      console.error("Error fetching information:", error);
      setInformation([
        { information: "Error fetching health information" },
        { information: "Error fetching budget information" },
        { information: "Error fetching alternatives" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleInformation() {
    await getInfo();
  }

  return (
    <div className="container d-flex flex-column gradient-bg" style={{ height: "100vh" }}>
      <div className="small-section">
        <h1 className="text-center text-white">Product Information</h1>
        <div className="text-center">
          {image ? (
            <img
              src={image}
              alt="Captured"
              style={{ width: "50%", maxWidth: "600px", borderRadius: "10px" }}
            />
          ) : (
            <p className="text-white">No image captured yet.</p>
          )}
        </div>
      </div>
      <div className="info-section">
        <div className="info-box">
          <h2>Health</h2>
          <p className="response-text">{information[0]?.information || ""}</p>
        </div>
        <div className="info-box">
          <h2>Budget</h2>
          <p className="response-text">{information[1]?.information || ""}</p>
        </div>
        <div className="info-box">
          <h2>Alternatives</h2>
          <p className="response-text">{information[2]?.information || ""}</p>
        </div>
      </div>
      <div className="d-flex justify-content-center align-items-center" style={{ marginTop: "auto", padding: "20px" }}>
        <button onClick={handleInformation} className="btn btn-primary" disabled={loading} style={{display: `${information[2] ? "none" : "inline-block"}`}}> 
          {loading ? "Fetching..." : "Get Info"}
        </button>
        <button onClick={() => {
                  setInformation([]); // Clear the information
                  switchPage(); // Switch the page
                }} className="btn btn-secondary">
          Back
        </button>
      </div>
    </div>
  );
}

export default Info;