interface SidebarProps {
  socialMedia: string;
  options: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({ socialMedia, options }) => {
  return (
    <div className="flex flex-col w-80 bg-white rounded-xl shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <h1 className="text-[#111418] text-base font-medium leading-normal">Social Media Account</h1>
          <p className="text-[#5f7186] text-sm font-normal leading-normal">{socialMedia}</p>
        </div>
        <div className="flex flex-col gap-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#eaedf0]">
              <p className="text-[#111418] text-sm font-medium leading-normal">{option}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
