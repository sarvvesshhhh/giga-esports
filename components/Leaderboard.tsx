export default function Leaderboard({ 
  users, 
  currentUser 
}: { 
  users: any[], 
  currentUser: string 
}) {
  return (
    <div className="w-full max-w-md mt-12 mb-12">
      <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-4 text-center">
        Global Intelligence Ranking
      </h3>

      <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg overflow-hidden">
        {/* TABLE HEADER */}
        <div className="grid grid-cols-4 p-3 bg-[#111] text-[10px] text-gray-500 uppercase font-bold border-b border-[#222]">
          <div className="text-center">Rank</div>
          <div className="col-span-2">Agent</div>
          <div className="text-right">Score</div>
        </div>

        {/* LIST OF PLAYERS */}
        {users.map((user, index) => {
          const isMe = user.username === currentUser;
          const rank = index + 1;
          
          let rankColor = "text-gray-500";
          if (rank === 1) rankColor = "text-yellow-500"; // Gold
          if (rank === 2) rankColor = "text-gray-300";   // Silver
          if (rank === 3) rankColor = "text-orange-600"; // Bronze

          return (
            <div 
              key={user.id} 
              className={`grid grid-cols-4 p-3 border-b border-[#1a1a1a] items-center text-sm ${isMe ? 'bg-red-900/10 border-l-2 border-l-red-600' : ''}`}
            >
              <div className={`text-center font-mono font-bold ${rankColor}`}>#{rank}</div>
              
              <div className="col-span-2 flex flex-col">
                <span className={`font-bold ${isMe ? 'text-white' : 'text-gray-400'}`}>
                  {user.username} {isMe && "(YOU)"}
                </span>
                <span className="text-[9px] text-gray-600 uppercase">{user.archetype}</span>
              </div>
              
              <div className="text-right font-mono text-gray-300">
                {user.gigaScore}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* FOOTER */}
      <div className="text-[9px] text-center text-gray-700 mt-2 font-mono">
        UPDATES LIVE // COMPETITION IS ABSOLUTE
      </div>
    </div>
  );
}