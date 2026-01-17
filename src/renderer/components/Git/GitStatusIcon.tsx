import type { GitFileStatusCode } from '@shared/types';

interface GitStatusIconProps {
  index: GitFileStatusCode;
  workingDir: GitFileStatusCode;
}

export function GitStatusIcon({ index, workingDir }: GitStatusIconProps) {
  // Determine the most relevant status to display
  const status = index !== ' ' ? index : workingDir;

  if (status === ' ') return null;

  const { label, color, title } = getStatusInfo(status);

  return (
    <span
      className="git-status-icon"
      style={{ color, fontWeight: 'bold', marginLeft: '4px', fontSize: '11px' }}
      title={title}
    >
      {label}
    </span>
  );
}

function getStatusInfo(status: GitFileStatusCode): { label: string; color: string; title: string } {
  switch (status) {
    case 'M':
      return { label: 'M', color: '#e2c08d', title: 'Modified' };
    case 'A':
      return { label: 'A', color: '#73c991', title: 'Added' };
    case 'D':
      return { label: 'D', color: '#f14c4c', title: 'Deleted' };
    case 'R':
      return { label: 'R', color: '#73c991', title: 'Renamed' };
    case 'C':
      return { label: 'C', color: '#73c991', title: 'Copied' };
    case 'U':
      return { label: 'U', color: '#f14c4c', title: 'Unmerged' };
    case '?':
      return { label: 'U', color: '#73c991', title: 'Untracked' };
    case '!':
      return { label: '!', color: '#858585', title: 'Ignored' };
    default:
      return { label: '', color: 'inherit', title: '' };
  }
}
