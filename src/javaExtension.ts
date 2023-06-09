/**
 * VSCode Java Extension Pack JDK Auto
 * Copyright (c) Shinji Kashihara.
 */
import * as vscode from 'vscode';
import { log } from './autoContext';
export const CONFIG_KEY_RUNTIMES = 'java.configuration.runtimes';

/**
 * Returns the names of the available VSCode JDT runtimes.
 * @returns The VSCode JDT runtime names.
 */
export function getAvailableNames(): string[] {
    // Do not add redhat.java extension to extensionDependencies,
    // because JDK Auto will not start when redhat activation error occurs.
    const redhatJava = vscode.extensions.getExtension('redhat.java');
    const redhatProp = redhatJava?.packageJSON?.contributes?.configuration?.properties;
    const jdtRuntimeNames:string[] = redhatProp?.[CONFIG_KEY_RUNTIMES]?.items?.properties?.name?.enum ?? [];
    if (jdtRuntimeNames.length === 0) {
        log.warn('Failed getExtension RedHat', redhatJava);
    }
    return jdtRuntimeNames;
}

/**
 * Returns the versions of the available VSCode JDT runtimes.
 * @returns The VSCode JDT runtime versions.
 */
export function getAvailableVersions(): number[] {
    return getAvailableNames().map(versionOf);
}

/**
 * Returns the JDK major version that matches the given JDK.
 * @param runtimeName The name of the VSCode JDT runtime.
 * @returns The JDK major version. NaN if invalid.
 */
export function versionOf(runtimeName:string): number {
    return Number(runtimeName.replace(/^J(ava|2)SE-(1\.|)/, '')); // NaN if invalid
}

/**
 * Returns the VSCode JDT runtime name that matches the given JDK major version.
 * @param majorVersion The JDK major version.
 * @returns The VSCode JDT runtime name.
 */
export function nameOf(majorVersion:number): string {
    if (majorVersion <= 5) {
        return 'J2SE-1.' + majorVersion;
    } else if (majorVersion <= 8) {
        return 'JavaSE-1.' + majorVersion;
    }
    return 'JavaSE-' + majorVersion;
}
