export default function AlarmPopup({
  alert,
  onClose,
  price,
  stopSound,
}: any) {
  if (!alert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-[360px] rounded-2xl border border-red-500 bg-black p-6 text-center">

        <div className="text-red-400 text-xl font-bold mb-3">
          🚨 Price ON
        </div>

        <div className="space-y-2 text-sm">

  <div>
   {alert.symbol}
  </div>

  <div>
   {alert.type}
  </div>

  <div>
   {alert.price ?? "-"}
  </div>

  <div className="text-yellow-400 text-lg">
   live : {price}
  </div>

  <div>
    On :  
    {alert.triggeredAt
      ? new Date(alert.triggeredAt).toLocaleTimeString()
      : "-"}
  </div>

</div>

        <button
          onClick={() => {
            stopSound();
            onClose();
          }}
          className="mt-4 w-full bg-red-500 py-2 rounded"
        >
          X
        </button>
      </div>
    </div>
  );
}