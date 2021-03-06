import React from "react"
import { Flipped } from "../Flipped"
import TestRenderer from "react-test-renderer"

describe("Flipped Component", () => {
  it("adds a data-flip-id attribute", () => {
    const testRenderer = TestRenderer.create(
      <Flipped flipId="foo">
        <div />
      </Flipped>
    )
    expect(testRenderer.toJSON().props["data-flip-id"]).toEqual("foo")
  })
  it("adds a data-inverse-flip-id attribute", () => {
    const testRenderer = TestRenderer.create(
      <Flipped inverseFlipId="foo2">
        <div />
      </Flipped>
    )
    expect(testRenderer.toJSON().props["data-inverse-flip-id"]).toEqual("foo2")
  })


  it("only if provided with a portalKey prop, puts that on the attributes to help with document scoped selection ", () => {
    const testRenderer = TestRenderer.create(
      <Flipped portalKey="plants">
        <div />
      </Flipped>
    )
    expect(testRenderer.toJSON().props["data-portal-key"]).toBe("plants")

    const testRenderer2 = TestRenderer.create(
      <Flipped>
        <div />
      </Flipped>
    )
    expect(testRenderer2.toJSON().props["data-flip-portal-key"]).toBe(undefined)
  })
  it("adds all data transform attributes if none are specified", () => {
    const testRenderer = TestRenderer.create(
      <Flipped flipId="foo">
        <div />
      </Flipped>
    )

    const flipConfig = JSON.parse(
      testRenderer.toJSON().props["data-flip-config"]
    )

    expect(flipConfig).toEqual({ translate: true, scale: true, opacity: true })
  })

  it("doesn't add any additional transform attributes if at least one was specified", () => {
    const testRenderer2 = TestRenderer.create(
      <Flipped flipId="foo" opacity>
        <div />
      </Flipped>
    )

    const flipConfig2 = JSON.parse(
      testRenderer2.toJSON().props["data-flip-config"]
    )

    expect(flipConfig2).toEqual({ opacity: true })
  })

  it("adds scale transforms", () => {
    const testRenderer = TestRenderer.create(
      <Flipped flipId="foo" scale>
        <div />
      </Flipped>
    )
    const flipConfig = JSON.parse(
      testRenderer.toJSON().props["data-flip-config"]
    )

    expect(flipConfig).toEqual({ scale: true })
  })

  it("adds translate transforms", () => {
    const testRenderer = TestRenderer.create(
      <Flipped flipId="foo" translate>
        <div />
      </Flipped>
    )

    const flipConfig = JSON.parse(
      testRenderer.toJSON().props["data-flip-config"]
    )

    expect(flipConfig).toEqual({ translate: true })
  })

  describe("spring props", () => {
    it("if it detects the ", () => {})
  })

  it("passed props if function as a child", () => {
    const testRenderer = TestRenderer.create(
      <Flipped flipId="foo" inverseFlipId="bar">
        {(flippedProps => <div {...flippedProps} />)}
      </Flipped>
    )
    expect(testRenderer.toJSON().props).toEqual({
      'data-flip-id': 'foo',
      'data-inverse-flip-id': 'bar',
      'data-flip-config': JSON.stringify({ translate: true, scale: true, opacity: true })
    });
  });
})
