import { useState } from "react";
import { SAMPLE_PEERS } from "../model/peers";

export function usePeersViewModel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [peers] = useState(SAMPLE_PEERS);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement search functionality
  };

  const handleAddFriend = () => {
    // TODO: Navigate to add friends page
  };

  return {
    peers,
    searchQuery,
    hasPeers: peers.length > 0,
    handleSearch,
    handleAddFriend,
  };
}
