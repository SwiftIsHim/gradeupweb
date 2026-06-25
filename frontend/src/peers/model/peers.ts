export interface Peer {
  id: string;
  name: string;
  username: string;
  avatar: string;
  studyStreak: number;
  topicsStudying: string[];
  mutualFriends?: number;
}

export interface PeersData {
  peers: Peer[];
  hasPeers: boolean;
}

export const SAMPLE_PEERS: Peer[] = [];
