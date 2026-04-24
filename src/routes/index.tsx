import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Upload } from "../components/Upload";
import { PipelineProgress } from "../components/PipelineProgress";
import { Dashboard } from "../components/Dashboard";
import { useDetectionStore } from "../store/detectionStore";

type Screen = "upload" | "pipeline" | "dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SPECTRASHIELD — Hyperspectral Anomaly Detection" },
      {
        name: "description",
        content:
          "Dual-engine hyperspectral anomaly detection. U-Net + RX score fusion for unsupervised target discovery in spectral imaging cubes.",
      },
      { property: "og:title", content: "SPECTRASHIELD — Hyperspectral Anomaly Detection" },
      {
        property: "og:description",
        content: "Dual-engine hyperspectral anomaly detection. NASA-grade scientific interface.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [screen, setScreen] = useState<Screen>("upload");
  const reset = useDetectionStore((s) => s.reset);

  return (
    <>
      {screen === "upload" && <Upload onInitialize={() => setScreen("pipeline")} />}
      {screen === "pipeline" && <PipelineProgress onComplete={() => setScreen("dashboard")} />}
      {screen === "dashboard" && (
        <Dashboard
          onNewAnalysis={() => {
            reset();
            setScreen("upload");
          }}
        />
      )}
    </>
  );
}
