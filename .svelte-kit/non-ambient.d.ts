
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/auth" | "/auth/login" | "/auth/register" | "/dashboard" | "/dashboard/admin" | "/dashboard/admin/missions" | "/dashboard/admin/professionnels" | "/dashboard/admin/rapports" | "/dashboard/admin/utilisateurs" | "/dashboard/patient" | "/dashboard/patient/demander" | "/dashboard/patient/historique" | "/dashboard/patient/medicaments" | "/dashboard/pro" | "/dashboard/pro/suivi" | "/offline" | "/video";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/auth": Record<string, never>;
			"/auth/login": Record<string, never>;
			"/auth/register": Record<string, never>;
			"/dashboard": Record<string, never>;
			"/dashboard/admin": Record<string, never>;
			"/dashboard/admin/missions": Record<string, never>;
			"/dashboard/admin/professionnels": Record<string, never>;
			"/dashboard/admin/rapports": Record<string, never>;
			"/dashboard/admin/utilisateurs": Record<string, never>;
			"/dashboard/patient": Record<string, never>;
			"/dashboard/patient/demander": Record<string, never>;
			"/dashboard/patient/historique": Record<string, never>;
			"/dashboard/patient/medicaments": Record<string, never>;
			"/dashboard/pro": Record<string, never>;
			"/dashboard/pro/suivi": Record<string, never>;
			"/offline": Record<string, never>;
			"/video": Record<string, never>
		};
		Pathname(): "/" | "/auth/login" | "/auth/register" | "/dashboard/admin" | "/dashboard/admin/missions" | "/dashboard/admin/professionnels" | "/dashboard/admin/rapports" | "/dashboard/admin/utilisateurs" | "/dashboard/patient" | "/dashboard/patient/demander" | "/dashboard/patient/historique" | "/dashboard/patient/medicaments" | "/dashboard/pro" | "/dashboard/pro/suivi" | "/offline" | "/video";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/appointments.png" | "/dashboard-admin.png" | "/icon-192.png" | "/icon-512.png" | "/login-page.png" | "/manifest.webmanifest" | "/mobile-home.png" | "/sw.js" | string & {};
	}
}