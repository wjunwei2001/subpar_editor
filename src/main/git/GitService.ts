import simpleGit, { SimpleGit, StatusResult } from 'simple-git';
import type { GitStatus, GitBranchInfo, GitFileStatus, GitFileStatusCode } from '../../shared/types';

export class GitService {
  private git: SimpleGit;
  private repoPath: string;

  constructor(repoPath: string) {
    this.repoPath = repoPath;
    this.git = simpleGit(repoPath);
  }

  static async isRepo(path: string): Promise<boolean> {
    try {
      const git = simpleGit(path);
      return await git.checkIsRepo();
    } catch {
      return false;
    }
  }

  async getStatus(): Promise<GitStatus> {
    try {
      const status: StatusResult = await this.git.status();

      const files: GitFileStatus[] = status.files.map(file => ({
        path: file.path,
        index: this.mapStatusCode(file.index),
        workingDir: this.mapStatusCode(file.working_dir),
      }));

      return {
        isRepo: true,
        branch: status.current || null,
        ahead: status.ahead,
        behind: status.behind,
        files,
        staged: status.staged,
        modified: status.modified,
        untracked: status.not_added,
      };
    } catch (error) {
      console.error('Git status error:', error);
      return {
        isRepo: false,
        branch: null,
        ahead: 0,
        behind: 0,
        files: [],
        staged: [],
        modified: [],
        untracked: [],
      };
    }
  }

  async getBranch(): Promise<GitBranchInfo> {
    try {
      const branchSummary = await this.git.branch();
      return {
        current: branchSummary.current,
        all: branchSummary.all,
      };
    } catch (error) {
      console.error('Git branch error:', error);
      return {
        current: '',
        all: [],
      };
    }
  }

  async stage(files: string[]): Promise<void> {
    await this.git.add(files);
  }

  async unstage(files: string[]): Promise<void> {
    await this.git.reset(['HEAD', '--', ...files]);
  }

  async commit(message: string): Promise<void> {
    await this.git.commit(message);
  }

  async diff(filePath?: string): Promise<string> {
    if (filePath) {
      return await this.git.diff([filePath]);
    }
    return await this.git.diff();
  }

  private mapStatusCode(code: string): GitFileStatusCode {
    const validCodes: GitFileStatusCode[] = ['M', 'A', 'D', 'R', 'C', 'U', '?', '!', ' '];
    if (validCodes.includes(code as GitFileStatusCode)) {
      return code as GitFileStatusCode;
    }
    return ' ';
  }
}
