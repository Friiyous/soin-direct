export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16'),
	() => import('./nodes/17'),
	() => import('./nodes/18'),
	() => import('./nodes/19'),
	() => import('./nodes/20'),
	() => import('./nodes/21'),
	() => import('./nodes/22'),
	() => import('./nodes/23'),
	() => import('./nodes/24'),
	() => import('./nodes/25')
];

export const server_loads = [];

export const dictionary = {
		"/": [5],
		"/auth/login": [6],
		"/auth/register": [7],
		"/dashboard/admin": [8,[2]],
		"/dashboard/admin/missions": [9,[2]],
		"/dashboard/admin/professionnels": [10,[2]],
		"/dashboard/admin/rapports": [11,[2]],
		"/dashboard/admin/utilisateurs": [12,[2]],
		"/dashboard/patient": [13,[3]],
		"/dashboard/patient/chat": [14,[3]],
		"/dashboard/patient/demander": [15,[3]],
		"/dashboard/patient/dossier": [16,[3]],
		"/dashboard/patient/historique": [17,[3]],
		"/dashboard/patient/medicaments": [18,[3]],
		"/dashboard/patient/onboarding": [19,[3]],
		"/dashboard/patient/ordonnances": [20,[3]],
		"/dashboard/patient/rendez-vous": [21,[3]],
		"/dashboard/pro": [22,[4]],
		"/dashboard/pro/suivi": [23,[4]],
		"/offline": [24],
		"/video": [25]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
	
	reroute: (() => {}),
	transport: {}
};

export const decoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.decode]));
export const encoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.encode]));

export const hash = false;

export const decode = (type, value) => decoders[type](value);

export { default as root } from '../root.svelte';