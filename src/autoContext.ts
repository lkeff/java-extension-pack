/*! VS Code Extension (c) 2023 Shinji Kashihara (cypher256) @ WILL */
import * as fs from 'fs';
import { GlobOptionsWithFileTypesUnset, glob } from 'glob';
import * as path from 'path';
import * as vscode from 'vscode';
import which = require('which');

/**
 * The output channel for the extension.
 */
export const log: vscode.LogOutputChannel = vscode.window.createOutputChannel('Auto Config Java', {log:true});

/**
 * An interface for the OS information.
 */
export namespace OS {
	let _locale = 'en';
	try {
		_locale = JSON.parse(process.env.VSCODE_NLS_CONFIG!)?.osLocale.toLowerCase() ?? _locale;
	} catch (error) {
		log.info('Failed get osLocale', error);
	}
	export const locale = _locale;
	export const isWindows = process.platform === 'win32';
	export const isMac = process.platform === 'darwin';
	export const isLinux = process.platform === 'linux';
}

/**
 * The extension context.
 */
let context: vscode.ExtensionContext;

/**
 * Initializes the extension context.
 * @param _context The extension context.
 */
export function init(_context: vscode.ExtensionContext) {
	context = _context;
}

/**
 * Returns the extension context.
 * @returns The extension context.
 */
export function getContext() {
	return context;
}

/**
 * Returns the global storage path.
 * @returns The global storage path.
 */
export function getGlobalStoragePath(): string {
	if (!context) {throw new Error('context is not initialized');}
	return context.globalStorageUri.fsPath;
}

/**
 * Returns true if the checkDir is not in the global storage path.
 * @param checkDir The directory to check.
 * @returns true if not in the global storage path.
 */
export function isUserInstalled(checkDir:string): boolean {
	function _normalizePath (dir:string) {
		const d = path.normalize(dir);
		return OS.isWindows ? d.toLowerCase() : d;
	}
	const _checkDir = _normalizePath(checkDir);
	const _globalStoragePath = _normalizePath(getGlobalStoragePath());
	return !_checkDir.startsWith(_globalStoragePath);
}

/**
 * Finds all instances of a specified executable in the PATH environment variable.
 * @param cmd The command to search for.
 * @returns The full path to the command.
 */
export async function whichPath(cmd:string) {
	try {
		return await which(cmd);
	} catch (error) {
		log.info('which check:', error);
		return undefined;
	}
}

/**
 * Returns true if the path is a file.
 * @param p The path.
 * @returns true if the path is a file.
 */
export function existsFile(p:string) {
	return fs.existsSync(p) && fs.statSync(p).isFile();
}

/**
 * Returns true if the path is a directory.
 * @param p The path.
 * @returns true if the path is a directory.
 */
export function existsDirectory(p:string) {
	return fs.existsSync(p) && fs.statSync(p).isDirectory();
}

/**
 * Returns the file content as string.
 * @param file The file path.
 * @returns The file content as string.
 */
export function readString(file:string): string | undefined {
	return existsFile(file) ? fs.readFileSync(file).toString() : undefined;
}

/**
 * Remove directory recursively.
 * @param p The directory path.
 */
export function rmQuietly(p:string) {
	fs.rm(p, {recursive: true, force: true}, e => {
		if (e) {
			log.info('Failed rm:', e); // Silent
		}
	});
}

/**
 * Synchronous remove directory recursively.
 * @param p The directory path.
 */
export function rmSyncQuietly(p:string) {
	try {
		fs.rmSync(p, {recursive: true, force: true});
	} catch (e) {
		log.info('Failed rmSync:', e); // Silent
	}
}

/**
 * Synchronous create directory recursively.
 * @param p The directory path.
 * @returns true if created.
 */
export function mkdirSyncQuietly(p:string): boolean {
	try {
		if (!fs.existsSync(p)) {
			fs.mkdirSync(p, {recursive: true});
			return true;
		}
	} catch (e) {
		log.info('Failed mkdirSync:', e); // Silent
	}
	return false;
}

/**
 * Search paths by glob pattern.
 * @param pattern The glob pattern.
 * @param options The glob options.
 * @returns The found paths.
 */
export async function globSearch(
	pattern: string | string[],
	options?: GlobOptionsWithFileTypesUnset | undefined): Promise<string[]> {
	try {
		const pats = Array.isArray(pattern) ? pattern : [pattern];
		const slashGlobs = pats.map(p => p.replace(/\\/g, '/'));
		return await glob(slashGlobs, options);
	} catch (error) {
		log.info('glob error:', error); // Silent
		return [];
	}
}
