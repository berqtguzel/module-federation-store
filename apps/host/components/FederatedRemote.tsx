import type { ComponentType } from 'react';
import { useEffect, useState } from 'react';

export type RemoteModule<Props extends object = Record<string, never>> = {
  default: ComponentType<Props>;
};

type RemoteState<Props extends object> =
  | { status: 'loading' }
  | { status: 'ready'; Component: ComponentType<Props> }
  | { status: 'error' };

type FederatedRemoteProps<Props extends object> = {
  label: string;
  loader: () => Promise<RemoteModule<Props>>;
  componentProps: Props;
};

export default function FederatedRemote<Props extends object>({
  label,
  loader,
  componentProps
}: FederatedRemoteProps<Props>) {
  const [state, setState] = useState<RemoteState<Props>>({ status: 'loading' });

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

  const Component = state.Component;
  return <Component {...componentProps} />;
}

