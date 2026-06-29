import { generateRemotionVideo } from './services/remotion.service.js';

async function test() {
    console.log("Starting test...");
    const dummyAst = {
        type: "sequence",
        children: [
            {
                type: "scene", durationInFrames: 150, layout: {
                    type: "kinetic_title", text: "Premium Remotion UI", palette: "HR_Palette"
                }
            },
            {
                type: "scene", durationInFrames: 150, layout: {
                    type: "bento", data: ["Speed", "Quality", "Scale", "AI"], palette: "Marketing_Palette"
                }
            },
            {
                type: "scene", durationInFrames: 150, layout: {
                    type: "bar_chart", title: "Quarterly Growth", data: [40, 80, 60, 100], labels: ["Q1", "Q2", "Q3", "Q4"], palette: "IT_Palette"
                }
            }
        ]
    };
    try {
        const url = await generateRemotionVideo(dummyAst, "test-project-123");
        console.log("Success! URL:", url);
    } catch (e) {
        console.error("Failed:", e);
    }
}

test();
