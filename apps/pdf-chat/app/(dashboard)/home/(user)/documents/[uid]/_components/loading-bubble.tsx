function LoadingBubble() {
  const dotClassName = `rounded-full dark:bg-dark-600 bg-gray-100 h-2.5 w-2.5`;

  return (
    <div
      className={
        'animate-in slide-in-from-bottom-12 duration-1000 ease-out py-4 mt-4'
      }
    >
      <div className={'flex space-x-1 animate-bounce duration-750'}>
        <div className={dotClassName} />
        <div className={dotClassName} />
        <div className={dotClassName} />
      </div>
    </div>
  );
}

export default LoadingBubble;
