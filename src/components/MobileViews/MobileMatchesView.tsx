import { useState } from "react";
import { MoreVertical, RefreshCcw, Pencil, Pause } from "lucide-react";

export function MobileMatchesView() {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditUpcomingModal, setShowEditUpcomingModal] = useState(false);
  const [showUpcomingMenu, setShowUpcomingMenu] = useState<string | null>(null);

  const teamLogo =
    "https://images.unsplash.com/photo-1760907217330-133432b74939?w=100&h=100&fit=crop";

  return (
    <div className="min-h-screen from-[#d5e5ec] via-[#e0f2f1] to-[#c8e6d4] pb-20">
      {/* Live Now Section */}
      <div className="px-4 mt-4 mb-6">
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              <h2 className="font-semibold text-gray-800">Live Now</h2>
            </div>
            <div className="bg-red-600 text-white text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              LIVE
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border-2 border-red-500 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col items-center flex-1">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mb-2 overflow-hidden">
                    <img
                      src={teamLogo}
                      alt="Team"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium text-center">
                    Single Aunty
                  </span>
                  <div className="mt-2 text-xs text-gray-600 space-y-0.5">
                    <div>Karma Dorji 1</div>
                  </div>
                </div>

                <div className="flex flex-col items-center px-6">
                  <div className="text-3xl font-bold text-gray-800 mb-1">
                    1-2
                  </div>
                  <div className="text-xs text-gray-500">21-9-2026</div>
                  <div className="text-sm font-semibold text-gray-700">
                    20:00
                  </div>
                </div>

                <div className="flex flex-col items-center flex-1">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mb-2 overflow-hidden">
                    <img
                      src={teamLogo}
                      alt="Team"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium text-center">
                    Single Aunty
                  </span>
                  <div className="mt-2 text-xs text-gray-600 space-y-0.5">
                    <div>1 Karma Dorji</div>
                    <div>1 Sonam Wang</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowUpdateModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[#0e7490] text-[#0e7490] rounded-md hover:bg-[#0e7490]/5 transition-colors text-sm font-medium"
                >
                  <RefreshCcw size={16} />
                  <span>Update</span>
                </button>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[#0e7490] text-[#0e7490] rounded-md hover:bg-[#0e7490]/5 transition-colors text-sm font-medium"
                >
                  <Pencil size={16} />
                  <span>Edit</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium">
                  <Pause size={16} />
                  <span>End</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Section */}
      <div className="px-4 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">Upcoming</h2>
        <div className="space-y-3">
          {[1, 2].map((item, index) => (
            <div
              key={item}
              className="bg-white rounded-xl shadow-sm p-4 relative"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">FRI</div>
                    <div className="text-2xl font-bold text-gray-800">28</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      Single Aunty VS Uncle
                    </div>
                    <div className="text-xs text-gray-500">21:00</div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setShowUpcomingMenu(
                      showUpcomingMenu === `upcoming-${item}`
                        ? null
                        : `upcoming-${item}`,
                    )
                  }
                  className="p-2 text-gray-400 hover:text-gray-600 relative"
                >
                  <MoreVertical size={20} />
                  {showUpcomingMenu === `upcoming-${item}` && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 w-24">
                      <button
                        onClick={() => {
                          setShowEditUpcomingModal(true);
                          setShowUpcomingMenu(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100">
                        Delete
                      </button>
                    </div>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Result Section */}
      <div className="px-4 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">Recent Result</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden">
                    <img
                      src={teamLogo}
                      alt="Team"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium">Single Aunty</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-[#0e7490] text-white px-4 py-1.5 rounded-md">
                    <div className="text-sm font-bold">1-2</div>
                    <div className="text-xs">Friday,15,24</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden">
                      <img
                        src={teamLogo}
                        alt="Team"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium">Uncles Pand</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {/* <MobileUpdateScoreModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onUpdate={(data) => console.log('Update:', data)}
      />
      <MobileEditMatchModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onEdit={(data) => console.log('Edit:', data)}
      />
      <MobileEditUpcomingMatchModal
        isOpen={showEditUpcomingModal}
        onClose={() => setShowEditUpcomingModal(false)}
        onEdit={(data) => console.log('Edit upcoming:', data)}
      /> */}
    </div>
  );
}
