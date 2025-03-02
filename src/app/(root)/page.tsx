import EditorPanel from "./_components/EditorPanel";
import Header from "./_components/Header";
import OutputPanel from "./_components/OutputPanel";
import ProblemPanel from "./_components/ProblemPanel";

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1800px] mx-auto p-4">
        <Header />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <EditorPanel />
          
          <div className="flex flex-col gap-4 h-full">
            <ProblemPanel />
            <OutputPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
