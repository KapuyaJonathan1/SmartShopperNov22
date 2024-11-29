import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
function Info({ health, budget, image, store, switchPage }) {
  const [information, setInformation] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()

  const itemPrompt = `If this is not food, answer with exactly these words: "Not Food." Otherwise please say what the item in the picture is. For example, if it is Kraft Mac and Cheese, you would only say "Kraft Mac and Cheese".`

  async function getInfo(imageID) {
    setLoading(true);
    try {
      const item = await axios.post("https://smartshoppernov22.onrender.com/api/get-info", {
        prompt: itemPrompt,
        image: image,
        //path: './images/image.png',
        delete: false
      });
      const food = item.data.information

      if(food === "Not Food") {
        setInformation([
          { information: "Unrecognized Food" },
          { information: "Unrecognized Food" },
          { information: "Unrecognized Food" },
        ]);
        return;
      }

      const response1 = await axios.post("https://smartshoppernov22.onrender.com/api/get-info", {
        prompt:  `List 3 pros and 3 cons of ${food} considering a ${health} health importance. These pros and cons need to be 3-5 words each. 

        Format:
         Pros:
          - Pro 1
          - Pro 2
          - Pro 3
         Cons:
          - Con 1
          - Con 2
          - Con 3`,
        delete: false
      });
      const response2 = await axios.post("https://smartshoppernov22.onrender.com/api/get-info", {
        prompt: `Considering a budget of: ${budget} and a health importance of: ${health}, 
is the product "${food}" within budget? Respond with a simple yes or no. 
If no, briefly explain why (e.g., too expensive, cheaper alternatives).`,
        delete: false
      });
      const response3 = await axios.post("https://smartshoppernov22.onrender.com/api/get-info", {
        prompt: `List 3 alternative products to ${food} available at ${store}. 
- Prioritize options that fit the user's health importance: ${health} and budget: ${budget}.
- Only list the product names, separated by commas (,) with no additional information.

Format:
- Item 1
- Item 2
- Item 3

`,
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
                  navigate("/scanner") // Switch the page
                }} className="btn btn-secondary">
          Back
        </button>
      </div>
    </div>
  );
}

export default Info;