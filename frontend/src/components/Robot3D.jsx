import AICursor from "../components/AICursor";

export default function Robot3D() {
  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden bg-transparent">
      {/* 
        The iframe is scaled slightly larger and shifted so that the 
        "Built with Spline" watermark at the bottom right gets clipped out
        by the parent container's overflow-hidden.
      */}
      <iframe 
        src="https://my.spline.design/genkubgreetingrobot-AhxYt4ThqeripptQOl8HrBnf/"
        frameBorder="0"
        title="AI Robot"
        className="absolute top-[-5%] left-[-5%] w-[110%] h-[110%]"
      />
      
      {/* 
        Absolute position a subtle overlay at the bottom right just in case 
        scaling isn't enough on ultra wide or specific aspect ratios 
      */}
      <div className="absolute bottom-0 right-0 w-36 h-12 bg-slate-900/40 backdrop-blur-md border-t border-l border-slate-800 rounded-tl-xl z-10 pointer-events-none" />
      
      <AICursor />
    </div>
  );
}
