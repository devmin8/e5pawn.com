import { admin } from 'better-auth/plugins';
import { defaultAc, userAc } from 'better-auth/plugins/admin/access';

export const adminPlugin = admin({
	defaultRole: 'user',
	adminRoles: ['admin'],
	roles: {
		admin: defaultAc.newRole({
			user: ['create', 'list', 'get', 'update', 'set-email', 'ban'],
			session: ['list', 'revoke']
		}),
		user: userAc
	},
	schema: {
		user: {
			fields: {
				banned: 'inactive',
				banReason: 'inactiveReason',
				banExpires: 'inactiveUntil'
			}
		}
	},
	bannedUserMessage: 'Your account is inactive. Please contact your administrator.'
});
