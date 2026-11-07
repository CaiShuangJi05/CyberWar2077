import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('【新夜城防護協定】捕獲未處理異常 (Uncaught Exception):', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetAndReload = () => {
    try {
      localStorage.removeItem('neo_nights_lang');
      localStorage.removeItem('neo_nights_leaderboard_v1');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#060810] text-slate-100 font-mono select-none overflow-y-auto">
          {/* Cyberpunk Grid Background */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:24px_24px]" />

          <div className="relative w-full max-w-xl bg-slate-950/95 border-2 border-red-500/70 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.35)] p-6 sm:p-8 flex flex-col space-y-5">
            {/* Header Badge */}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
              <span className="text-xs font-bold tracking-widest text-red-400 uppercase">
                SYSTEM FAILURE RECOVERY PROTOCOL // 系統異常防護機制
              </span>
            </div>

            {/* Error Title */}
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide">
                  新夜城戰術模擬中斷
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Neo-Nights tactical simulation encountered an unexpected anomaly.
                </p>
              </div>
            </div>

            {/* Technical Detail Log */}
            <div className="p-3.5 rounded-xl bg-black/80 border border-slate-800 text-[11px] text-red-300/90 font-mono overflow-x-auto max-h-36">
              <div className="font-bold text-slate-400 mb-1">【錯誤診斷日誌】</div>
              <div>{this.state.error?.toString() || '未知執行時錯誤 (Unknown Runtime Error)'}</div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                重新載入戰線 (RELOAD)
              </button>

              <button
                onClick={this.handleResetAndReload}
                className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-red-500/50 text-slate-300 hover:text-red-300 font-bold text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
                title="清除所有本地暫存數據並重新啟動"
              >
                <RotateCcw className="w-4 h-4 text-red-400" />
                重置暫存並重啟
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
