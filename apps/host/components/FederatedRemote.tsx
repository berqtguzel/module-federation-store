import type { ComponentType } from 'react';
import { useEffect, useState } from 'react';

export type RemoteModule = {
  default: ComponentType;
};

type RemoteState =
  | { status: 'loading' }
  | { status: 'ready'; Component: ComponentType }
  | { status: 'error' };

type FederatedRemoteProps = {
  label: string;
  loader: () => Promise<RemoteModule>;
};

export default function FederatedRemote({ label, loader }: FederatedRemoteProps) {
  const [state, setState] = useState<RemoteState>({ status: 'loading' });

  useEffect(() => {
    let active = true;

    loader()
      .then((remoteModule) => {
        if (active) {
          setState({ status: 'ready', Component: remoteModule.default });
        }
      })
      .catch(() => {
        if (active) {
          setState({ status: 'error' });
        }
      });

    return () => {
      active = false;
    };
  }, [loader]);

  if (state.status === 'loading') {
    return <div className="remote-state">{label} yükleniyor…</div>;
  }

  if (state.status === 'error') {
    return (
      <div className="remote-state remote-state-error" role="alert">
        {label} şu anda kullanılamıyor. Diğer bölümleri kullanmaya devam edebilirsiniz.
      </div>
    );
  }

  return <state.Component />;
}

