import logo from '../assets/logo.png';
export default function SpiderLoader() {
  return (
    <div className="relative w-12 h-12">
      {/* Dark spider */}
      <img
        src={logo}
        alt="Loading"
        className="absolute inset-0 w-full h-full opacity-20"
      />

      {/* Filling spider */}
      <div className="spider-fill">
        <img
          src={logo}
          alt="Loading"
          className="w-full h-full spider-glow"
        />
      </div>
    </div>
  );
}