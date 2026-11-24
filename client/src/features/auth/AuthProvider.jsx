import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { authApi } from '../../api/auth.js';
import { AuthContext } from './auth-context.js';

export function AuthProvider({ children, initialSession = null, client = authApi }) {
  const [session, setSession] = useState(initialSession);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      login: async (credentials) => {
        const nextSession = await client.login(credentials);
        setSession(nextSession);
        return nextSession;
      },
      register: async (details) => {
        const nextSession = await client.register(details);
        setSession(nextSession);
        return nextSession;
      },
      logout: () => setSession(null),
    }),
    [client, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const userShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  email: PropTypes.string,
  role: PropTypes.oneOf(['customer', 'admin']).isRequired,
});

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
  initialSession: PropTypes.shape({
    token: PropTypes.string.isRequired,
    user: userShape.isRequired,
  }),
  client: PropTypes.shape({
    login: PropTypes.func.isRequired,
    register: PropTypes.func.isRequired,
  }),
};
