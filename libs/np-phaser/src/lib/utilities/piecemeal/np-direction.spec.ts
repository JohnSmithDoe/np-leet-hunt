import {
    AllDirections,
    EDirection,
    mapRexPluginDirection,
    mapToRexPluginDirection,
    rotate180,
    rotateLeft45,
    rotateRight45,
    rotateRight90,
} from './np-direction';

describe('direction rotations', () => {
    it('rotateRight45 steps clockwise through the compass', () => {
        expect(rotateRight45(EDirection.N)).toBe(EDirection.NE);
        expect(rotateRight45(EDirection.NE)).toBe(EDirection.E);
    });

    it('eight 45° right rotations return to the start', () => {
        for (const dir of AllDirections) {
            let d = dir;
            for (let i = 0; i < 8; i++) d = rotateRight45(d);
            expect(d).toBe(dir);
        }
    });

    it('rotateLeft45 is the inverse of rotateRight45', () => {
        for (const dir of AllDirections) {
            expect(rotateLeft45(rotateRight45(dir))).toBe(dir);
        }
    });

    it('rotate180 applied twice is the identity', () => {
        for (const dir of AllDirections) {
            expect(rotate180(rotate180(dir))).toBe(dir);
        }
    });

    it('rotateRight90 equals two rotateRight45 steps', () => {
        for (const dir of AllDirections) {
            expect(rotateRight90(dir)).toBe(rotateRight45(rotateRight45(dir)));
        }
    });

    it('NONE is invariant under rotation', () => {
        expect(rotateRight45(EDirection.NONE)).toBe(EDirection.NONE);
        expect(rotate180(EDirection.NONE)).toBe(EDirection.NONE);
    });
});

describe('rex-plugin direction mapping', () => {
    it('round-trips every real direction through the rex codes', () => {
        for (const dir of AllDirections) {
            const code = mapToRexPluginDirection(dir);
            expect(code).toBeDefined();
            expect(mapRexPluginDirection(code!)).toBe(dir);
        }
    });

    it('maps NONE to undefined', () => {
        expect(mapToRexPluginDirection(EDirection.NONE)).toBeUndefined();
    });
});
