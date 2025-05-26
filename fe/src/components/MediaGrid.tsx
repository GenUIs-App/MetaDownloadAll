interface MediaItem {
  imageUrl: string;
}

interface MediaGridProps {
  items: MediaItem[];
  title: string;
}

export const MediaGrid: React.FC<MediaGridProps> = ({ items, title }) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <h1 className="text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">
          {title}
        </h1>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
        {items.map((item, index) => (
          <div key={index} className="flex flex-col gap-3">
            <div
              className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"
              style={{ backgroundImage: `url(${item.imageUrl})` }}
            ></div>
          </div>
        ))}
      </div>
      <div className="flex px-4 py-3 justify-end">
        <button
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#b5cae2] text-[#111418] text-sm font-bold leading-normal tracking-[0.015em]"
        >
          <span className="truncate">Download All</span>
        </button>
      </div>
    </div>
  );
};
